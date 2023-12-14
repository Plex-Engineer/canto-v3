import { waitForTransaction as evmWait } from "wagmi/actions";
import { Transaction } from "../interfaces";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { signEVMTransaction } from "./evm";
import { signKeplrTx } from "./keplr";
import { signCosmosEIPTx, waitForCosmosTx } from "./cosmosEIP/signCosmosEIP";

/**
 * @notice signs a single
 * @dev will know if EVM or COSMOS tx to perform
 * @param {Transaction} tx transaction to perform
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function signTransaction(
  tx: Transaction
): PromiseWithError<string> {
  switch (tx.type) {
    case "EVM":
      // perform evm tx
      return await signEVMTransaction(tx);
    case "COSMOS":
      // perform cosmos tx
      return await signCosmosEIPTx(tx);
    case "KEPLR":
      // perform keplr tx
      return await signKeplrTx(tx);
    default:
      return NEW_ERROR("signTransaction::unknown tx type");
  }
}

/**
 * @notice checks if the transaction was successful/confirmed
 * @dev will know if EVM or COSMOS tx to check
 * @param {string} txType type of transaction
 * @param {number} chainId chainId of transaction
 * @param {string} hash hash of transaction
 * @returns {PromiseWithError<{status: string, error: any}>} status of transaction or error
 */
export async function waitForTransaction(
  txType: "EVM" | "COSMOS" | "KEPLR",
  chainId: number | string,
  hash: string
): PromiseWithError<{
  status: string;
  error: any;
}> {
  switch (txType) {
    case "EVM":
      const receipt = await evmWait({
        chainId: chainId as number,
        hash: hash as `0x${string}`,
        confirmations: 1,
      });
      return NO_ERROR({
        status: receipt.status,
        error: receipt.logs,
      });
    case "COSMOS":
    case "KEPLR":
      return waitForCosmosTx(chainId, hash);
    default:
      return NEW_ERROR("waitForTransaction: unknown tx type: " + txType);
  }
}
