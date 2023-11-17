import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { Transaction } from "../interfaces";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";

/**
 * @notice signs cosmos transaction using keplr
 * @param {Transaction} tx transaction to perform
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function signKeplrTx(tx: Transaction): PromiseWithError<string> {
  try {
    // check tx type and chain id
    if (tx.type !== "KEPLR")
      throw Error(TX_SIGN_ERRORS.INCORRECT_TX_TYPE(tx.type));
    if (typeof tx.chainId !== "string")
      throw new Error(TX_SIGN_ERRORS.INVALID_CHAIN_ID(tx.chainId));

    // sign tx
    const { data: txResponse, error: txError } = await tx.tx();
    if (txError) throw txError;

    // get the txHash from the response
    const { data: txHash, error: hashError } = tx.getHash(txResponse);
    if (hashError) throw hashError;

    return NO_ERROR(txHash);
  } catch (err) {
    return NEW_ERROR("signKeplrTx", err);
  }
}
