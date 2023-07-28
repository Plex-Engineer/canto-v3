import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import {
  CosmosTxContext,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { ethToCantoAddress } from "@/utils/address.utils";
import { tryFetch } from "@/utils/async.utils";
import {
  createEIP712,
  generateMessageWithMultipleTransactions,
} from "@tharsis/eip712";
import {
  createTxRawEIP712,
  signatureToWeb3Extension,
} from "@tharsis/transactions";
import { createTransactionWithMultipleMessages } from "@tharsis/proto";

export async function getCosmosAccount(
  ethAddress: string,
  chainId: number
): PromiseWithError<any> {
  const { data: cantoAddress, error } = await ethToCantoAddress(ethAddress);
  if (error) {
    return NEW_ERROR("getCosmosAccount::" + error.message);
  }
  const { data: apiEndpoint, error: apiEndpointError } =
    getCosmosAPIEndpoint(chainId);
  if (apiEndpointError) {
    return NEW_ERROR("getCosmosAccount::" + apiEndpointError.message);
  }
  const { data: result, error: fetchError } = await tryFetch(
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
    const message = generateMessageWithMultipleTransactions(
      context.sender.accountNumber.toString(),
      context.sender.sequence.toString(),
      context.chain.cosmosChainId,
      context.memo,
      tx.fee,
      [tx.eipMsg]
    );
    const eipToSign = createEIP712(
      tx.typesObject,
      context.chain.chainId,
      message
    );
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [context.ethAddress, JSON.stringify(eipToSign)],
    });
    const extension = signatureToWeb3Extension(
      context.chain,
      context.sender,
      signature
    );
    const cosmosTxToBroadcast = createTransactionWithMultipleMessages(
      [tx.cosmosMsg],
      context.memo,
      tx.fee.amount,
      tx.fee.denom,
      Number(tx.fee.gas),
      "ethsecp256",
      context.sender.pubkey,
      context.sender.sequence,
      context.sender.accountNumber,
      context.chain.cosmosChainId
    );
    const raw = createTxRawEIP712(
      cosmosTxToBroadcast.legacyAmino.body,
      cosmosTxToBroadcast.legacyAmino.authInfo,
      extension
    );
    const postOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: generatePostBodyBroadcast(raw),
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
    toBinary: () => Uint8Array;
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
  txRaw: any,
  broadcastMode: string = BroadcastMode.Sync
) {
  return `{ "tx_bytes": [${txRaw.message
    .toBinary()
    .toString()}], "mode": "${broadcastMode}" }`;
}
