import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  coin,
  DeliverTxResponse,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { IBCToken } from "../../interfaces/tokens";
import { CosmosNetwork } from "@/config/interfaces/networks";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { checkPubKeyETH, ethToCantoAddress } from "@/utils/address.utils";
import { CANTO_MAINNET_COSMOS, EVMOS, INJECTIVE } from "@/config/networks";
import { getBlockTimestamp, getIBCData } from "../methods/ibc";
import { Transaction } from "@/config/interfaces/transactions";
import { getCosmosAPIEndpoint } from "@/utils/networks.utils";
import { connectToKeplr } from "@/utils/keplr/connectKeplr";
import {
  ChainRestAuthApi,
  ChainRestTendermintApi,
  BaseAccount,
  DEFAULT_STD_FEE,
  createTransaction,
  MsgTransfer,
  makeTimeoutTimestampInNs,
  getTxRawFromTxRawOrDirectSignResponse,
  CosmosTxV1Beta1Tx,
} from "@injectivelabs/sdk-ts";
import {
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
  BigNumberInBase,
} from "@injectivelabs/utils";
import {
  createTransactionWithMultipleMessages,
  createTxRaw,
} from "@evmos/proto";
import { createMsgsIBCTransfer } from "@/utils/cosmos/transactions/messages/ibc/ibc";
import {
  generatePostBodyBroadcast,
  getSenderObj,
} from "@/utils/cosmos/transactions/helpers.utils";
import { tryFetch } from "@/utils/async.utils";
import Long from "long";

/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using keplr
 * @dev will try to connect to keplr if not already done so
 * @param {CosmosNetwork} cosmosNetwork network to ibc from
 * @param {string} cosmosSender cosmos address to send from
 * @param {string} ethReceiver eth address to send to on canto
 * @param {IBCToken} ibcToken token to send
 * @param {string} amount amount to send
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function ibcInKeplr(
  cosmosNetwork: CosmosNetwork,
  cosmosSender: string,
  ethReceiver: string,
  ibcToken: IBCToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check if we can obtain the keplr client
  const { data: keplrClient, error: clientError } = await connectToKeplr(
    cosmosNetwork
  );
  if (clientError) {
    return NEW_ERROR("ibcInKeplr::" + clientError.message);
  }
  // check that client has the same address as the cosmosSender
  if (keplrClient.address !== cosmosSender) {
    return NEW_ERROR(
      "ibcInKeplr: keplr address does not match cosmos sender: " +
        keplrClient.address +
        " != " +
        cosmosSender
    );
  }

  // make parameter checks
  const { data: hasPubKey, error: checkPubKeyError } = await checkPubKeyETH(
    ethReceiver,
    CANTO_MAINNET_COSMOS.chainId
  );
  if (checkPubKeyError) {
    return NEW_ERROR("ibcInKeplr::" + checkPubKeyError.message);
  }
  if (!hasPubKey) {
    return NEW_ERROR(
      "ibcInKeplr: no public key found for eth address: " + ethReceiver
    );
  }

  // get canto address from ethReceiver
  const { data: cantoReceiver, error: ethToCantoError } =
    await ethToCantoAddress(ethReceiver);
  if (ethToCantoError) {
    return NEW_ERROR("ibcInKeplr::" + ethToCantoError.message);
  }

  /** Make check for specific chains (injective, evmos) */
  if (cosmosNetwork.chainId === INJECTIVE.chainId) {
    return await injectiveIBCIn(
      cosmosNetwork,
      cosmosSender,
      cantoReceiver,
      ibcToken.nativeName,
      amount
    );
  }
  /** call this after getting timestamp information */
  if (cosmosNetwork.chainId === EVMOS.chainId) {
    return await evmosIBCIn(
      cosmosNetwork,
      cosmosSender,
      cantoReceiver,
      ibcToken.nativeName,
      amount
    );
  }

  // get the channel number from the network
  const ibcChannel =
    IBC_CHANNELS[cosmosNetwork.id as keyof typeof IBC_CHANNELS];

  // check if chennel was found
  if (!ibcChannel || !ibcChannel.toCanto) {
    return NEW_ERROR("ibcInKeplr: invalid channel id: " + cosmosNetwork.id);
  }

  // get block timeout timestamp
  const { data: blockTimestamp, error: timestampError } =
    await getBlockTimestamp(
      getCosmosAPIEndpoint(CANTO_MAINNET_COSMOS.chainId).data
    );
  if (timestampError) {
    return NEW_ERROR("ibcInKeplr::" + timestampError.message);
  }

  return NO_ERROR([
    {
      chainId: cosmosNetwork.chainId,
      description: "IBC In",
      type: "KEPLR",
      tx: async () => {
        return await signAndBroadcastIBCKeplr(keplrClient.client, {
          cosmosAccount: cosmosSender,
          cantoReceiver: cantoReceiver,
          amount: amount,
          denom: ibcToken.nativeName,
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
    },
  ]);
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
    return NEW_ERROR("signAndBroadcastIBCKeplr::" + errMsg(err));
  }
}

/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using injective
 * @dev will only work for injective
 * @param {CosmosNetwork} injectiveNetwork network to ibc from
 * @param {string} injectiveAddress injective address to send from
 * @param {string} cantoAddress canto address to send to
 * @param {string} denom denom to send
 * @param {string} amount amount to send
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
async function injectiveIBCIn(
  injectiveNetwork: CosmosNetwork,
  injectiveAddress: string,
  cantoAddress: string,
  denom: string,
  amount: string
): PromiseWithError<Transaction[]> {
  // check injective chain
  if (injectiveNetwork.chainId !== INJECTIVE.chainId) {
    return NEW_ERROR(
      "injectiveIBCIn: invalid chain id for injective: " +
        injectiveNetwork.chainId
    );
  }
  // get the channel number from the network
  const ibcChannel =
    IBC_CHANNELS[injectiveNetwork.id as keyof typeof IBC_CHANNELS];
  // check if chennel was found
  if (!ibcChannel || !ibcChannel.toCanto) {
    return NEW_ERROR(
      "injectiveIBCIn: invalid channel id: " + injectiveNetwork.id
    );
  }

  /** Account Details **/
  const chainRestAuthApi = new ChainRestAuthApi(injectiveNetwork.restEndpoint);
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
    injectiveAddress
  );
  const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
  const accountDetails = baseAccount.toAccountDetails();

  /** Block Details */
  const chainRestTendermintApi = new ChainRestTendermintApi(
    injectiveNetwork.restEndpoint
  );
  const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
  const latestHeight = latestBlock.header.height;
  const timeoutHeight = new BigNumberInBase(latestHeight).plus(
    DEFAULT_BLOCK_TIMEOUT_HEIGHT
  );

  /** Message **/
  const msg = MsgTransfer.fromJSON({
    port: "transfer",
    memo: "injectiveIBC",
    sender: injectiveAddress,
    receiver: cantoAddress,
    channelId: ibcChannel.toCanto,
    timeout: makeTimeoutTimestampInNs(),
    height: {
      revisionHeight: timeoutHeight.toNumber(),
      revisionNumber: parseInt(latestBlock.header.version.block, 10),
    },
    amount: {
      denom,
      amount: amount,
    },
  });

  /** Prepare the Transaction **/
  const { signDoc } = createTransaction({
    pubKey: accountDetails.pubKey.key,
    chainId: injectiveNetwork.chainId,
    fee: DEFAULT_STD_FEE,
    message: [msg],
    sequence: accountDetails.sequence,
    timeoutHeight: timeoutHeight.toNumber(),
    accountNumber: accountDetails.accountNumber,
  });

  /** Signature and Broadcast Tx */
  async function signAndBroadcast(): PromiseWithError<unknown> {
    try {
      /** Sign the Transaction **/
      const offlineSigner = window.keplr?.getOfflineSigner(
        injectiveNetwork.chainId
      );

      const directSignResponse = await offlineSigner?.signDirect(
        injectiveAddress,
        //@ts-ignore
        signDoc
      );
      if (!directSignResponse) {
        return NEW_ERROR("injectiveIBCIn: no direct sign response");
      }
      const txRaw = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);
      /** Broadcast the Transaction **/
      return NO_ERROR(
        await window.keplr?.sendTx(
          injectiveNetwork.chainId,
          CosmosTxV1Beta1Tx.TxRaw.encode(txRaw).finish(),
          //@ts-ignore
          "sync"
        )
      );
    } catch (err) {
      return NEW_ERROR("injectiveIBCIn::" + errMsg(err));
    }
  }

  return NO_ERROR([
    {
      chainId: injectiveNetwork.chainId,
      description: "IBC In",
      type: "KEPLR",
      tx: signAndBroadcast,
      getHash: (txResponse: Uint8Array) =>
        NO_ERROR(Buffer.from(txResponse).toString("hex")),
    },
  ]);
}

/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using evmos
 * @dev will only work for evmos
 * @param {CosmosNetwork} evmosNetwork network to ibc from
 * @param {string} evmosAddress evmos address to send from
 * @param {string} cantoAddress canto address to send to
 * @param {string} denom denom to send
 * @param {string} amount amount to send
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
async function evmosIBCIn(
  evmosNetwork: CosmosNetwork,
  evmosAddress: string,
  cantoAddress: string,
  denom: string,
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
    denom,
    amount,
    cosmosSender: evmosAddress,
    cosmosReceiver: cantoAddress,
    timeoutTimestamp: blockTimestamp.slice(0, 9) + "00000000000",
    revisionNumber: Number(ibcData.height.revision_number),
    revisionHeight: Number(ibcData.height.revision_height) + 1000,
    memo: "",
  });

  // get context
  const { data: senderObj, error: senderObjError } = await getSenderObj(
    evmosAddress,
    evmosNetwork.chainId
  );
  if (senderObjError) {
    return NEW_ERROR("performCosmosTxEIP::" + senderObjError);
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
      return NEW_ERROR("evmosIBCIn::signAndBroadcast::" + errMsg(err));
    }
  }
  return NO_ERROR([
    {
      chainId: evmosNetwork.chainId,
      description: "IBC in",
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
