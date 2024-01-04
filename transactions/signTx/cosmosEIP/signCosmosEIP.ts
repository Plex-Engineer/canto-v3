import {
  CosmosTxContext,
  EIP712FeeObject,
  Fee,
  Transaction,
  UnsignedCosmosMessages,
} from "../../interfaces";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { getEvmSignerOnChainId } from "../evm";
import { getCosmosAPIEndpoint } from "@/utils/networks";
import { createTransactionWithMultipleMessages } from "@evmos/proto";
import {
  createTxRawEIP712,
  signatureToWeb3Extension,
} from "@evmos/transactions";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";
import {
  generateMessageWithMultipleTransactions,
  createEIP712,
} from "@evmos/eip712";
import { sleep, tryFetch, tryFetchWithRetry } from "@/utils/async";
import { generateCosmosEIP712TxContext } from "./txContext";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";

export async function signCosmosEIPTx(
  tx: Transaction
): PromiseWithError<string> {
  try {
    if (tx.type !== "COSMOS") throw Error("not cosmos tx");
    if (typeof tx.chainId !== "number")
      throw Error("invalid chainId: " + tx.chainId);

    /** switch chains if neccessary and get signer */
    const { data: signer, error: signerError } = await getEvmSignerOnChainId(
      tx.chainId
    );
    if (signerError) throw signerError;

    /** check signer and tx from address */
    if (signer.account.address !== tx.fromAddress)
      throw Error(
        TX_SIGN_ERRORS.INCORRECT_SIGNER(tx.fromAddress, signer.account.address)
      );

    /** tx context */
    const { data: txContext, error: contextError } =
      await generateCosmosEIP712TxContext(tx.chainId, signer.account.address);
    if (contextError) throw contextError;

    /** create and sign transaction */
    const { data: txData, error: txError } =
      await signAndBroadcastCosmosTransaction(
        {
          chain: txContext.chainObj,
          sender: txContext.senderObj,
          fee: tx.msg.fee,
          memo: "signed with metamask",
          ethAddress: tx.fromAddress,
        },
        tx.msg
      );
    if (txError) throw txError;

    /** check if transaction was successful */
    if (txData.tx_response.code !== 0) throw Error(txData.tx_response.raw_log);

    return NO_ERROR(txData.tx_response.txhash);
  } catch (err) {
    return NEW_ERROR("signCosmosEIPTx", err);
  }
}

/**
 * @notice signs and broadcasts a cosmos transaction
 * @param {CosmosTxContext} context context for tx
 * @param {UnsignedCosmosMessages} tx unsigned tx to sign and broadcast
 * @returns {PromiseWithError<any>} return data of broadcast or error
 */
async function signAndBroadcastCosmosTransaction(
  context: CosmosTxContext,
  tx: UnsignedCosmosMessages
): PromiseWithError<any> {
  try {
    // create correct fee object for EIP712
    const feeObj = generateFeeObj(tx.fee, context.sender.accountAddress);

    // check if multiple messages are included in transactions
    const eipMsgArray = Array.isArray(tx.eipMsg) ? tx.eipMsg : [tx.eipMsg];
    const cosmosMsgArray = Array.isArray(tx.cosmosMsg)
      ? tx.cosmosMsg
      : [tx.cosmosMsg];

    // create eip payload
    const eipPayload = generateMessageWithMultipleTransactions(
      context.sender.accountNumber.toString(),
      context.sender.sequence.toString(),
      context.chain.cosmosChainId,
      context.memo,
      feeObj,
      eipMsgArray
    );
    const eipToSign = createEIP712(
      tx.typesObject,
      context.chain.chainId,
      eipPayload
    );

    // check public key on sender object, if none, create one
    if (!context.sender.pubkey) {
      // create a public key for the user IFF EIP712 Canto is used (since through metamask)
      try {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [context.ethAddress, "generate_pubkey"],
        });
        context.sender.pubkey = signatureToPubkey(
          signature,
          Buffer.from([
            50, 215, 18, 245, 169, 63, 252, 16, 225, 169, 71, 95, 254, 165, 146,
            216, 40, 162, 115, 78, 147, 125, 80, 182, 25, 69, 136, 250, 65, 200,
            94, 178,
          ])
        );
        // sleep for 2 seconds to allow for the wallet to refresh
        await sleep(2000);
      } catch (err) {
        return NEW_ERROR("signAndBroadcastCosmosTransaction", err);
      }
    }

    // create cosmos payload
    const cosmosPayload = createTransactionWithMultipleMessages(
      cosmosMsgArray,
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
      signatureToWeb3Extension(
        context.chain,
        {
          accountAddress: context.sender.accountAddress,
          sequence: context.sender.sequence,
          accountNumber: context.sender.accountNumber,
          pubkey: context.sender.pubkey,
        },
        signature
      )
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
      getCosmosAPIEndpoint(context.chain.cosmosChainId).data +
        "/cosmos/tx/v1beta1/txs",
      postOptions
    );

    if (broadcastPost.error) {
      return NEW_ERROR(
        "signAndBroadcastCosmosTransaction",
        broadcastPost.error
      );
    }
    return NO_ERROR(broadcastPost.data);
  } catch (err) {
    return NEW_ERROR("signAndBroadcastCosmosTransaction", err);
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

export function generatePostBodyBroadcast(
  txRaw: TxToSend,
  broadcastMode: string = BroadcastMode.Sync
) {
  return `{ "tx_bytes": [${txRaw.message
    .serializeBinary()
    .toString()}], "mode": "${broadcastMode}" }`;
}

/**
 * @notice creates a fee object for EIP712
 * @param {Fee} fee fee object
 * @param {string} feePayer sender of tx
 * @returns {EIP712FeeObject}EIP712Fee object
 */
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

export async function waitForCosmosTx(
  chainId: string | number,
  txHash: string
): PromiseWithError<{
  status: string;
  error: any;
}> {
  // get cosmos tx data
  const { data: txData, error: txDataError } = await getCosmosTxDetailsFromHash(
    chainId,
    txHash
  );
  if (txDataError) {
    return NEW_ERROR("waitForTransaction", txDataError);
  }
  return NO_ERROR({
    status: txData.tx_response.code === 0 ? "success" : "fail",
    error: txData.tx_response.raw_log,
  });
}

interface CosmosTxResponse {
  tx: object;
  tx_response: {
    code: number;
    logs: Array<{
      events: Array<{
        type: string;
        attributes: Array<{ key: string; value: string }>;
      }>;
    }>;
    raw_log: string;
  };
}
export async function getCosmosTxDetailsFromHash(
  chainId: string | number,
  txHash: string
): PromiseWithError<CosmosTxResponse> {
  try {
    // get endpoint on correct chain
    const { data: endpoint, error: endpointError } =
      getCosmosAPIEndpoint(chainId);
    if (endpointError) throw endpointError;

    // get tx details
    const { data: response, error: fetchError } =
      await tryFetchWithRetry<CosmosTxResponse>(
        endpoint + "/cosmos/tx/v1beta1/txs/" + txHash,
        5
      );
    if (fetchError) throw fetchError;

    // return response
    return NO_ERROR(response);
  } catch (err) {
    return NEW_ERROR("getCosmosTxDetailsFromHash", err);
  }
}
