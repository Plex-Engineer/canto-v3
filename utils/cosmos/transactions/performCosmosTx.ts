import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";
import { GetWalletClientResult } from "wagmi/actions";
import { checkOnRightChain } from "../../baseTransaction.utils";
import {
  getSenderObj,
  signAndBroadcastCosmosTransaction,
} from "./helpers.utils";
import { getCosmosChainObject } from "../../networks.utils";
import { ethToCantoAddress } from "@/utils/address.utils";

/**
 * @notice performs a cosmos transaction through metamask EIP712
 * @dev this only performs EIP712 transactions through eth wallet on Canto
 * @param {Transaction} tx Transaction parameters
 * @param {GetWalletClientResult} signer eth signer information, (wallet client)
 * @returns {string} txhash or error
 */
export async function performCosmosTransactionEIP(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<string> {
  if (tx.type !== "COSMOS") {
    return NEW_ERROR("performCosmosTxEIP: not cosmos tx");
  }
  if (!signer) {
    return NEW_ERROR("performCosmosTxEIP: no signer");
  }
  if (typeof tx.chainId !== "number") {
    return NEW_ERROR("performCosmosTxEIP: invalid chainId: " + tx.chainId);
  }

  // need to obtain the eth signer canto address
  const { data: cantoAddress, error: ethToCantoError } =
    await ethToCantoAddress(signer.account.address);
  if (ethToCantoError) {
    return NEW_ERROR("performCosmosTxEIP::" + ethToCantoError.message);
  }

  const { data: onRightChain, error: chainError } = await checkOnRightChain(
    signer,
    tx.chainId
  );
  if (chainError || !onRightChain) {
    return NEW_ERROR("performCosmosTxEIP::" + chainError);
  }

  // create transaction context
  const { data: chainObj, error: chainObjError } = getCosmosChainObject(
    tx.chainId
  );
  if (chainObjError) {
    return NEW_ERROR("performCosmosTxEIP::" + chainObjError);
  }
  const { data: senderObj, error: senderObjError } = await getSenderObj(
    cantoAddress,
    tx.chainId
  );
  if (senderObjError) {
    return NEW_ERROR("performCosmosTxEIP::" + senderObjError);
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
    return NEW_ERROR("performCosmosTxEIP::" + txError);
  }
  if (txData.tx_response.code !== 0) {
    return NEW_ERROR("performCosmosTxEIP: " + txData.tx_response.raw_log);
  }

  return NO_ERROR(txData.tx_response.txhash);
}
