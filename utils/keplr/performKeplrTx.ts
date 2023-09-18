import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
} from "@/config/interfaces";

/**
 * @notice performs keplr transaction
 * @param {Transaction} tx transaction to perform
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function performKeplrTx(
  tx: Transaction
): PromiseWithError<string> {
  if (tx.type !== "KEPLR") {
    return NEW_ERROR("performKeplrTx: not keplr tx");
  }
  if (typeof tx.chainId !== "string") {
    return NEW_ERROR("performKeplrTx: invalid chainId" + tx.chainId);
  }
  const { data: txResponse, error: txError } = await tx.tx();
  if (txError) {
    return NEW_ERROR("performKeplrTx: " + txError.message);
  }

  // get the txHash from the response
  const { data: txHash, error: hashError } = tx.getHash(txResponse);
  if (hashError) {
    return NEW_ERROR("performKeplrTx: " + hashError.message);
  }

  return NO_ERROR(txHash);
}
