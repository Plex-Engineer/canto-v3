import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";

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
  const txResponse = await tx.tx();
  if (txResponse.error) {
    return NEW_ERROR("performKeplrTx: " + txResponse.error.message);
  }
  // no need to check the block explorer for txHash since the response will indicate success
  if (txResponse.data.code !== 0) {
    return NEW_ERROR("performKeplrTx: " + txResponse.data.rawLog);
  }
  return NO_ERROR(txResponse.data.transactionHash);
}
