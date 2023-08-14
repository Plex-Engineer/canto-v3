import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import {
  CosmosTxContext,
  EIP712FeeObject,
  Fee,
  Sender,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { ethToCantoAddress } from "@/utils/address.utils";
import { tryFetch } from "@/utils/async.utils";
import {
  generateMessageWithMultipleTransactions,
  createEIP712,
} from "@evmos/eip712";
import { createTransactionWithMultipleMessages } from "@evmos/proto";
import {
  createTxRawEIP712,
  signatureToWeb3Extension,
} from "@evmos/transactions";
interface CosmosAccountReturn {
  account: {
    base_account: {
      account_number: number;
      sequence: number;
      address: string;
      pub_key: {
        key: string;
      } | null;
    };
  };
}

export async function getCosmosAccount(
  ethAddress: string,
  chainId: number
): PromiseWithError<CosmosAccountReturn> {
  const { data: cantoAddress, error } = await ethToCantoAddress(ethAddress);
  if (error) {
    return NEW_ERROR("getCosmosAccount::" + error.message);
  }
  const { data: apiEndpoint, error: apiEndpointError } =
    getCosmosAPIEndpoint(chainId);
  if (apiEndpointError) {
    return NEW_ERROR("getCosmosAccount::" + apiEndpointError.message);
  }
  const { data: result, error: fetchError } =
    await tryFetch<CosmosAccountReturn>(
      apiEndpoint + `/cosmos/auth/v1beta1/accounts/${cantoAddress}`
    );
  if (fetchError) {
    return NEW_ERROR("getCosmosAccount::" + fetchError.message);
  }
  return NO_ERROR(result);
}

export async function signAndBroadcastCosmosTransaction(
  context: CosmosTxContext,
  tx: UnsignedCosmosMessages
): PromiseWithError<any> {
  try {
    // create correct fee object for EIP712
    const feeObj = generateFeeObj(tx.fee, context.sender.accountAddress);

    // create eip payload
    const eipPayload = generateMessageWithMultipleTransactions(
      context.sender.accountNumber.toString(),
      context.sender.sequence.toString(),
      context.chain.cosmosChainId,
      context.memo,
      feeObj,
      [tx.eipMsg]
    );
    const eipToSign = createEIP712(
      tx.typesObject,
      context.chain.chainId,
      eipPayload
    );
    // create cosmos payload
    const cosmosPayload = createTransactionWithMultipleMessages(
      [tx.cosmosMsg],
      context.memo,
      tx.fee.amount,
      tx.fee.denom,
      parseInt(tx.fee.gas, 10),
      "ethsecp256",
      context.sender.pubkey,
      context.sender.sequence,
      context.sender.accountNumber,
      context.chain.cosmosChainId
    );

    // get signature from metamask
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [context.ethAddress, JSON.stringify(eipToSign)],
    });
    const signedTx = createTxRawEIP712(
      cosmosPayload.legacyAmino.body,
      cosmosPayload.legacyAmino.authInfo,
      signatureToWeb3Extension(context.chain, context.sender, signature)
    );

    // post tx to rpc
    const postOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: generatePostBodyBroadcast(signedTx),
    };
    const broadcastPost = await tryFetch(
      getCosmosAPIEndpoint(context.chain.chainId).data +
        "/cosmos/tx/v1beta1/txs",
      postOptions
    );

    if (broadcastPost.error) {
      return NEW_ERROR(
        "signAndBroadcastCosmosTransaction: " + broadcastPost.error.message
      );
    }
    return NO_ERROR(broadcastPost.data);
  } catch (error) {
    return NEW_ERROR(
      "signAndBroadcastCosmosTransaction: " + (error as Error).message
    );
  }
}

interface TxToSend {
  message: {
    serializeBinary: () => Uint8Array;
  };
  path: string;
}
enum BroadcastMode {
  Unspecified = "BROADCAST_MODE_UNSPECIFIED",
  Block = "BROADCAST_MODE_BLOCK",
  Sync = "BROADCAST_MODE_SYNC",
  Async = "BROADCAST_MODE_ASYNC",
}

function generatePostBodyBroadcast(
  txRaw: TxToSend,
  broadcastMode: string = BroadcastMode.Sync
) {
  return `{ "tx_bytes": [${txRaw.message
    .serializeBinary()
    .toString()}], "mode": "${broadcastMode}" }`;
}

export async function getSenderObj(
  senderEthAddress: string,
  chainid: number
): PromiseWithError<Sender> {
  const cosmosAccount = await getCosmosAccount(senderEthAddress, chainid);
  if (cosmosAccount.error) {
    return NEW_ERROR("getSenderObj::" + cosmosAccount.error.message);
  }
  return reformatSender(cosmosAccount.data);
}

function reformatSender(
  accountData: CosmosAccountReturn
): ReturnWithError<Sender> {
  const baseAccount = accountData.account.base_account;
  if (baseAccount.pub_key == null) {
    return NEW_ERROR("reformatSender: pubkey is null");
  }
  return NO_ERROR({
    accountAddress: baseAccount.address,
    sequence: baseAccount.sequence,
    accountNumber: baseAccount.account_number,
    pubkey: baseAccount.pub_key.key,
  });
}

function generateFeeObj(fee: Fee, feePayer: string): EIP712FeeObject {
  return {
    amount: [
      {
        amount: fee.amount,
        denom: fee.denom,
      },
    ],
    gas: fee.gas,
    feePayer,
  };
}
