import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";
import { GetWalletClientResult } from "wagmi/actions";
import { checkOnRightChain } from "../baseTransaction.utils";
import { getCosmosChainObj } from "@/config/consts/apiUrls";
import {
  getSenderObj,
  signAndBroadcastCosmosTransaction,
} from "./transactions/helpers.utils";

// will return the cosmos txHash of the signed transaction
export async function performCosmosTransaction(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<string> {
  if (tx.type !== "COSMOS") {
    return NEW_ERROR("performCosmosTx: not cosmos tx");
  }
  if (!signer) {
    return NEW_ERROR("performCosmosTx: no signer");
  }
  if (typeof tx.chainId !== "number") {
    return NEW_ERROR("performCosmosTx: invalid chainId: " + tx.chainId);
  }
  const { data: onRightChain, error: chainError } = await checkOnRightChain(
    signer,
    tx.chainId
  );
  if (chainError || !onRightChain) {
    return NEW_ERROR("performCosmosTx::" + chainError);
  }

  // create transaction context
  const { data: chainObj, error: chainObjError } = getCosmosChainObj(
    tx.chainId
  );
  if (chainObjError) {
    return NEW_ERROR("performCosmosTx::" + chainObjError);
  }
  const { data: senderObj, error: senderObjError } = await getSenderObj(
    signer.account.address,
    tx.chainId
  );
  if (senderObjError) {
    return NEW_ERROR("performCosmosTx::" + senderObjError);
  }
  const { data: txData, error: txError } =
    await signAndBroadcastCosmosTransaction(
      {
        chain: chainObj,
        sender: senderObj,
        fee: tx.msg.fee,
        memo: "signed with metamask",
        ethAddress: signer.account.address,
      },
      tx.msg
    );
  if (txError) {
    return NEW_ERROR("performCosmosTx::" + txError);
  }
  if (txData.tx_response.code !== 0) {
    return NEW_ERROR("performCosmosTx: " + txData.tx_response.raw_log);
  }

  return NO_ERROR(txData.tx_response.txhash);
}
