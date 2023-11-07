import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
} from "@/config/interfaces";
import {
  GetWalletClientResult,
  waitForTransaction as evmWait,
} from "wagmi/actions";
import { performEVMTransaction } from "../evm/performEVMTx.utils";
import { performCosmosTransactionEIP, waitForCosmosTx } from "../cosmos";
import { performKeplrTx } from "../keplr";

/**
 * @notice performs a single transaction
 * @dev will know if EVM or COSMOS tx to perform
 * @param {Transaction} tx transaction to perform
 * @param {GetWalletClientResult} signer signer to perform tx with
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function performSingleTransaction(
  tx: Transaction,
  signer: GetWalletClientResult
): PromiseWithError<string> {
  switch (tx.type) {
    case "EVM":
      // perform evm tx
      return await performEVMTransaction(tx, signer);
    case "COSMOS":
      // perform cosmos tx
      return await performCosmosTransactionEIP(tx, signer);
    case "KEPLR":
      // perform keplr tx
      return await performKeplrTx(tx);
    default:
      return NEW_ERROR(
        "useTransactionStore::performSingleTransaction: unknown tx type"
      );
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
        confirmations: 2,
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
