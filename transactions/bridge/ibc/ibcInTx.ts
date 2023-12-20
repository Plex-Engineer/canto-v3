import {
  coin,
  DeliverTxResponse,
  SigningStargateClient,
} from "@cosmjs/stargate";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import {
  CANTO_MAINNET_COSMOS,
  CANTO_MAINNET_EVM,
  EVMOS,
  INJECTIVE,
} from "@/config/networks";
import { connectToKeplr } from "@/utils/keplr";
// import {
//   ChainRestAuthApi,
//   ChainRestTendermintApi,
//   BaseAccount,
//   DEFAULT_STD_FEE,
//   createTransaction,
//   MsgTransfer,
//   makeTimeoutTimestampInNs,
//   getTxRawFromTxRawOrDirectSignResponse,
//   CosmosTxV1Beta1Tx,
// } from "@injectivelabs/sdk-ts";
// import {
//   DEFAULT_BLOCK_TIMEOUT_HEIGHT,
//   BigNumberInBase,
// } from "@injectivelabs/utils";
import {
  createTransactionWithMultipleMessages,
  createTxRaw,
} from "@evmos/proto";
import { tryFetch } from "@/utils/async";
import Long from "long";
import { displayAmount } from "@/utils/formatting";
import { isIBCToken } from "@/utils/tokens";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import {
  Transaction,
  TX_DESCRIPTIONS,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import {
  CosmosNetwork,
  IBCToken,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import {
  getCosmosAPIEndpoint,
  getNetworkInfoFromChainId,
  isCosmosNetwork,
} from "@/utils/networks";
import { checkCantoPubKey, ethToCantoAddress } from "@/utils/address";
import { generateCantoPublicKeyWithTx } from "@/transactions/cosmos/publicKey";
import { getBlockTimestamp, getIBCData } from "./helpers";
import { createMsgsIBCTransfer } from "@/transactions/cosmos/messages/ibc/ibc";
import { BridgingMethod, getBridgeMethodInfo } from "..";
import { getCantoSenderObj } from "@/utils/cosmos";
import { generatePostBodyBroadcast } from "@/transactions/signTx/cosmosEIP/signCosmosEIP";

type IBCInParams = {
  senderCosmosAddress: string;
  cantoEthReceiverAddress: string;
  fromNetworkChainId: string;
  token: IBCToken;
  amount: string;
};
/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using keplr
 * @dev will try to connect to keplr if not already done so
 * @param {IBCInParams} txParams parameters for bridging in with keplr
 * @returns {PromiseWithError<TxCreatorFunctionReturn>} list of transactions to make or error
 */
export async function ibcInKeplr(
  txParams: IBCInParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** validate params */
    const validation = validateKeplrIBCParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    /** get cosmos network data */
    const { data: cosmosNetwork, error: networkError } =
      getNetworkInfoFromChainId(txParams.fromNetworkChainId);
    if (networkError) throw networkError;
    if (!isCosmosNetwork(cosmosNetwork)) throw new Error("invalid network");

    /** get keplr client */
    const { data: keplrClient, error: clientError } = await connectToKeplr(
      cosmosNetwork.chainId
    );
    if (clientError) throw clientError;
    if (keplrClient.address !== txParams.senderCosmosAddress)
      throw new Error("invalid keplr address");

    /** create tx list */
    const txList: Transaction[] = [];

    /** get canto receiver */
    const { data: cantoReceiver, error: ethToCantoError } =
      await ethToCantoAddress(txParams.cantoEthReceiverAddress);
    if (ethToCantoError) throw ethToCantoError;

    /** check public key */
    const { data: hasPubKey, error: checkPubKeyError } = await checkCantoPubKey(
      cantoReceiver,
      CANTO_MAINNET_COSMOS.chainId
    );
    if (checkPubKeyError || !hasPubKey) {
      // create public key on EVM
      const { data: pubKeyTxs, error: pubKeyError } =
        await generateCantoPublicKeyWithTx(
          CANTO_MAINNET_EVM.chainId,
          txParams.cantoEthReceiverAddress,
          cantoReceiver
        );
      if (pubKeyError) throw pubKeyError;
      txList.push(...pubKeyTxs);
    }

    /** specific chain check */
    if (cosmosNetwork.chainId === INJECTIVE.chainId)
      throw new Error("injective not supported yet");
    if (cosmosNetwork.chainId === EVMOS.chainId) {
      const { data: evmosTxs, error: evmosError } = await evmosIBCIn(
        cosmosNetwork,
        txParams.senderCosmosAddress,
        cantoReceiver,
        txParams.token,
        txParams.amount
      );
      if (evmosError) throw evmosError;
      txList.push(...evmosTxs);

      /** return here */
      return NO_ERROR({ transactions: txList });
    }

    /** get ibc data */
    const ibcChannel =
      IBC_CHANNELS[cosmosNetwork.id as keyof typeof IBC_CHANNELS];
    if (!ibcChannel || !ibcChannel.toCanto)
      throw new Error("invalid channel id: " + cosmosNetwork.id);

    /** timeout */
    const { data: blockTimestamp, error: timestampError } =
      await getBlockTimestamp(
        getCosmosAPIEndpoint(CANTO_MAINNET_COSMOS.chainId).data
      );
    if (timestampError) throw timestampError;

    /** create tx */
    txList.push({
      chainId: cosmosNetwork.chainId,
      fromAddress: txParams.senderCosmosAddress,
      description: TX_DESCRIPTIONS.BRIDGE(
        txParams.token.symbol,
        displayAmount(txParams.amount, txParams.token.decimals),
        cosmosNetwork.name,
        CANTO_MAINNET_COSMOS.name,
        getBridgeMethodInfo(BridgingMethod.IBC).name
      ),
      type: "KEPLR",
      tx: async () => {
        return await signAndBroadcastIBCKeplr(keplrClient.client, {
          cosmosAccount: txParams.senderCosmosAddress,
          cantoReceiver: cantoReceiver,
          amount: txParams.amount,
          denom: txParams.token.nativeName,
          channelToCanto: ibcChannel.toCanto,
          timeoutTimestamp: Number(blockTimestamp),
          memo: "ibcInKeplr",
        });
      },
      getHash: (txResponse: DeliverTxResponse) => {
        if (!txResponse || !txResponse.transactionHash) {
          return NEW_ERROR("ibcInKeplr: no transaction hash");
        }
        return NO_ERROR(txResponse.transactionHash);
      },
    });

    /** return here */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("ibcInKeplr", err);
  }
}

interface IBCKeplrParams {
  cosmosAccount: string;
  cantoReceiver: string;
  amount: string;
  denom: string;
  channelToCanto: string;
  timeoutTimestamp: number;
  memo: string;
}
/**
 * @notice signs and broadcasts an IBC transaction using keplr
 * @param {SigningStargateClient} keplrClient keplr client to use
 * @param {IBCKeplrParams} params parameters for the transaction
 * @returns {PromiseWithError<DeliverTxResponse>} response from the transaction or error
 */
async function signAndBroadcastIBCKeplr(
  keplrClient: SigningStargateClient,
  params: IBCKeplrParams
): PromiseWithError<DeliverTxResponse> {
  try {
    const ibcResponse = await keplrClient.sendIbcTokens(
      params.cosmosAccount,
      params.cantoReceiver,
      coin(params.amount, params.denom),
      "transfer",
      params.channelToCanto,
      undefined,
      params.timeoutTimestamp,
      "auto",
      params.memo
    );
    return NO_ERROR(ibcResponse);
  } catch (err) {
    return NEW_ERROR("signAndBroadcastIBCKeplr", err);
  }
}

// /**
//  * @notice creates a list of transactions that need to be made for IBC in to canto using injective
//  * @dev will only work for injective
//  * @param {CosmosNetwork} injectiveNetwork network to ibc from
//  * @param {string} injectiveAddress injective address to send from
//  * @param {string} cantoAddress canto address to send to
//  * @param {IBCToken} token token to send
//  * @param {string} amount amount to send
//  * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
//  */
// async function injectiveIBCIn(
//   injectiveNetwork: CosmosNetwork,
//   injectiveAddress: string,
//   cantoAddress: string,
//   token: IBCToken,
//   amount: string
// ): PromiseWithError<Transaction[]> {
//   // check injective chain
//   if (injectiveNetwork.chainId !== INJECTIVE.chainId) {
//     return NEW_ERROR(
//       "injectiveIBCIn: invalid chain id for injective: " +
//         injectiveNetwork.chainId
//     );
//   }
//   // get the channel number from the network
//   const ibcChannel =
//     IBC_CHANNELS[injectiveNetwork.id as keyof typeof IBC_CHANNELS];
//   // check if chennel was found
//   if (!ibcChannel || !ibcChannel.toCanto) {
//     return NEW_ERROR(
//       "injectiveIBCIn: invalid channel id: " + injectiveNetwork.id
//     );
//   }

//   /** Account Details **/
//   const chainRestAuthApi = new ChainRestAuthApi(injectiveNetwork.restEndpoint);
//   const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
//     injectiveAddress
//   );
//   const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
//   const accountDetails = baseAccount.toAccountDetails();

//   /** Block Details */
//   const chainRestTendermintApi = new ChainRestTendermintApi(
//     injectiveNetwork.restEndpoint
//   );
//   const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
//   const latestHeight = latestBlock.header.height;
//   const timeoutHeight = new BigNumberInBase(latestHeight).plus(
//     DEFAULT_BLOCK_TIMEOUT_HEIGHT
//   );

//   /** Message **/
//   const msg = MsgTransfer.fromJSON({
//     port: "transfer",
//     memo: "injectiveIBC",
//     sender: injectiveAddress,
//     receiver: cantoAddress,
//     channelId: ibcChannel.toCanto,
//     timeout: makeTimeoutTimestampInNs(),
//     height: {
//       revisionHeight: timeoutHeight.toNumber(),
//       revisionNumber: parseInt(latestBlock.header.version.block, 10),
//     },
//     amount: {
//       denom: token.nativeName,
//       amount: amount,
//     },
//   });

//   /** Prepare the Transaction **/
//   const { signDoc } = createTransaction({
//     pubKey: accountDetails.pubKey.key,
//     chainId: injectiveNetwork.chainId,
//     fee: DEFAULT_STD_FEE,
//     message: [msg],
//     sequence: accountDetails.sequence,
//     timeoutHeight: timeoutHeight.toNumber(),
//     accountNumber: accountDetails.accountNumber,
//   });

//   /** Signature and Broadcast Tx */
//   async function signAndBroadcast(): PromiseWithError<unknown> {
//     try {
//       /** Sign the Transaction **/
//       const offlineSigner = window.keplr?.getOfflineSigner(
//         injectiveNetwork.chainId
//       );

//       const directSignResponse = await offlineSigner?.signDirect(
//         injectiveAddress,
//         //@ts-ignore
//         signDoc
//       );
//       if (!directSignResponse) {
//         return NEW_ERROR("injectiveIBCIn: no direct sign response");
//       }
//       const txRaw = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);
//       /** Broadcast the Transaction **/
//       return NO_ERROR(
//         await window.keplr?.sendTx(
//           injectiveNetwork.chainId,
//           CosmosTxV1Beta1Tx.TxRaw.encode(txRaw).finish(),
//           //@ts-ignore
//           "sync"
//         )
//       );
//     } catch (err) {
//       return NEW_ERROR("injectiveIBCIn::" + errMsg(err));
//     }
//   }

//   return NO_ERROR([
//     {
//       chainId: injectiveNetwork.chainId,
//       description: TX_DESCRIPTIONS.BRIDGE(
//         token.symbol,
//         displayAmount(amount, token.decimals),
//         injectiveNetwork.name,
//         CANTO_MAINNET_COSMOS.name
//       ),
//       type: "KEPLR",
//       tx: signAndBroadcast,
//       getHash: (txResponse: Uint8Array) =>
//         NO_ERROR(Buffer.from(txResponse).toString("hex")),
//     },
//   ]);
// }

/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using evmos
 * @dev will only work for evmos
 * @param {CosmosNetwork} evmosNetwork network to ibc from
 * @param {string} evmosAddress evmos address to send from
 * @param {string} cantoAddress canto address to send to
 * @param {IBCToken} token token to send
 * @param {string} amount amount to send
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
async function evmosIBCIn(
  evmosNetwork: CosmosNetwork,
  evmosAddress: string,
  cantoAddress: string,
  token: IBCToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check evmos chain
  if (evmosNetwork.chainId !== EVMOS.chainId) {
    return NEW_ERROR(
      "evmosIBCIn: invalid chain id for evmos: " + evmosNetwork.chainId
    );
  }
  // get canto chain ibc data and timestamp
  const { data: ibcData, error: ibcError } = await getIBCData(
    CANTO_MAINNET_COSMOS.restEndpoint
  );
  if (ibcError) {
    return NEW_ERROR("txIBCOut::" + ibcError.message);
  }

  // get block timeout timestamp
  const { data: blockTimestamp, error: timestampError } =
    await getBlockTimestamp(
      getCosmosAPIEndpoint(CANTO_MAINNET_COSMOS.chainId).data
    );
  if (timestampError) {
    return NEW_ERROR("ibcInKeplr::" + timestampError.message);
  }

  // get ibc channel
  const ibcChannel = IBC_CHANNELS[evmosNetwork.id as keyof typeof IBC_CHANNELS];
  if (!ibcChannel || !ibcChannel.toCanto) {
    return NEW_ERROR("evmosIBCIn: invalid channel id: " + evmosNetwork.id);
  }

  // create messges
  const messages = createMsgsIBCTransfer({
    sourcePort: "transfer",
    sourceChannel: ibcChannel.toCanto,
    denom: token.nativeName,
    amount,
    cosmosSender: evmosAddress,
    cosmosReceiver: cantoAddress,
    timeoutTimestamp: blockTimestamp.slice(0, 9) + "00000000000",
    revisionNumber: Number(ibcData.height.revision_number),
    revisionHeight: Number(ibcData.height.revision_height) + 1000,
    memo: "",
  });

  // get context (use canto sender since evmos has same props)
  const { data: senderObj, error: senderObjError } = await getCantoSenderObj(
    evmosAddress,
    evmosNetwork.chainId
  );
  if (senderObjError) {
    return NEW_ERROR("performCosmosTxEIP::" + senderObjError);
  }
  // transaction would have already failed by now if no public key was present, but typeguard
  if (!senderObj.pubkey) {
    return NEW_ERROR("performCosmosTxEIP: no public key found");
  }
  // create payload for keplr
  const keplrPayload = createTransactionWithMultipleMessages(
    [messages.cosmosMsg],
    "ibc evmos to canto",
    "4000000000000000",
    "aevmos",
    parseInt("200000", 10),
    "ethsecp256",
    senderObj.pubkey,
    senderObj.sequence,
    senderObj.accountNumber,
    evmosNetwork.chainId
  );

  // signature and broadcast transaction
  async function signAndBroadcast(): PromiseWithError<unknown> {
    try {
      // sign with keplr
      const signResponse = await window.keplr?.signDirect(
        evmosNetwork.chainId,
        evmosAddress,
        {
          bodyBytes: keplrPayload.signDirect.body.serializeBinary(),
          authInfoBytes: keplrPayload.signDirect.authInfo.serializeBinary(),
          chainId: evmosNetwork.chainId,
          accountNumber: new Long(senderObj.accountNumber),
        }
      );
      if (!signResponse) {
        return NEW_ERROR("evmosIBCIn: no sign response");
      }
      const signatures = [
        new Uint8Array(
          Buffer.from(signResponse?.signature.signature, "base64")
        ),
      ];
      const { signed } = signResponse;
      const signedTx = createTxRaw(
        signed.bodyBytes,
        signed.authInfoBytes,
        signatures
      );
      // post tx to rpc
      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: generatePostBodyBroadcast(signedTx),
      };
      const { data: broadcastPost, error: broadcastError } = await tryFetch<{
        tx_response: DeliverTxResponse;
      }>(
        getCosmosAPIEndpoint(evmosNetwork.chainId).data +
          "/cosmos/tx/v1beta1/txs",
        postOptions
      );
      if (broadcastError) {
        return NEW_ERROR("evmosIBCIn: " + broadcastError.message);
      }
      return NO_ERROR(broadcastPost.tx_response);
    } catch (err) {
      return NEW_ERROR("evmosIBCIn::signAndBroadcast", err);
    }
  }
  return NO_ERROR([
    {
      chainId: evmosNetwork.chainId,
      fromAddress: evmosAddress,
      description: TX_DESCRIPTIONS.BRIDGE(
        token.symbol,
        displayAmount(amount, token.decimals),
        evmosNetwork.name,
        CANTO_MAINNET_COSMOS.name,
        getBridgeMethodInfo(BridgingMethod.IBC).name
      ),
      type: "KEPLR",
      tx: signAndBroadcast,
      getHash: (txResponse: { txhash: string }) => {
        if (!txResponse || !txResponse.txhash) {
          return NEW_ERROR("ibcInKeplr: no transaction hash");
        }
        return NO_ERROR(txResponse.txhash);
      },
    },
  ]);
}

/**
 * @notice validates the parameters  bridging in through IBC keplr
 * @param {IBCInParams} txParams parameters for bridging in
 * @returns {Validation} whether the parameters are valid or not
 */
export function validateKeplrIBCParams(txParams: IBCInParams): Validation {
  if (!isIBCToken(txParams.token)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("token"),
    };
  }
  return validateWeiUserInputTokenAmount(
    txParams.amount,
    "1",
    txParams.token.balance ?? "0",
    txParams.token.symbol,
    txParams.token.decimals
  );
}
