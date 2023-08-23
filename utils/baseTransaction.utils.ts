import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { GetWalletClientResult, switchNetwork } from "wagmi/actions";
import { performEVMTransaction } from "./evm/performEVMTx";
import { Transaction } from "@/config/interfaces/transactions";
import { performCosmosTransactionEIP } from "./cosmos/transactions/performCosmosTx";
import { waitForTransaction as evmWait } from "wagmi/actions";
import { tryFetchWithRetry } from "./async.utils";
import { performKeplrTx } from "./keplr/performKeplrTx";
import { getCosmosAPIEndpoint } from "./networks.utils";

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
  chainId: number,
  hash: string
): PromiseWithError<{
  status: string;
  error: any;
}> {
  switch (txType) {
    case "EVM":
      const receipt = await evmWait({
        chainId,
        hash: hash as `0x${string}`,
        confirmations: 1,
      });
      return NO_ERROR({
        status: receipt.status,
        error: receipt.logs,
      });
    case "COSMOS":
      const { data: endpoint, error: endpointError } =
        getCosmosAPIEndpoint(chainId);
      if (endpointError) {
        return NEW_ERROR("waitForTransaction::" + endpointError.message);
      }
      const { data: response, error: fetchError } = await tryFetchWithRetry<{
        tx_response: {
          code: number;
          raw_log: string;
        };
      }>(endpoint + "/cosmos/tx/v1beta1/txs/" + hash, 5);
      if (fetchError) {
        return NEW_ERROR("waitForTransaction::" + fetchError.message);
      }
      return NO_ERROR({
        status: response.tx_response.code === 0 ? "success" : "fail",
        error: response.tx_response.raw_log,
      });
    case "KEPLR":
      // when keplr transactions are signed, the return will have success or fail, no need to check
      return NO_ERROR({
        status: "success",
        error: "",
      });
    default:
      return NEW_ERROR("waitForTransaction: unknown tx type: " + txType);
  }
}

/**
 * @notice checks if the signer is on the right chain and tries to switch if not
 * @dev for EVM wallets
 * @param {GetWalletClientResult} signer EVM signing wallet client
 * @param {number} chainId chainId signer should be on
 * @returns {PromiseWithError<boolean>} if the signer is on the chain
 */
export async function checkOnRightChain(
  signer: GetWalletClientResult,
  chainId: number
): PromiseWithError<boolean> {
  if (!signer) {
    return NEW_ERROR("checkOnRightChain: no signer");
  }
  if (signer.chain.id !== chainId) {
    try {
      // attempt to switch chains
      const network = await switchNetwork({ chainId });
      if (!network || network.id !== chainId) {
        return NEW_ERROR("checkOnRightChain: error switching chains");
      }
    } catch (error) {
      return NEW_ERROR("checkOnRightChain: error switching chains");
    }
  }
  return NO_ERROR(true);
}
