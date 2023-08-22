import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { GetWalletClientResult, switchNetwork } from "wagmi/actions";
import { performEVMTransaction } from "./evm/performEVMTx";
import { Transaction } from "@/config/interfaces/transactions";
import { performCosmosTransaction } from "./cosmos/performCosmosTx";
import { waitForTransaction as evmWait } from "wagmi/actions";
import { tryFetchWithRetry } from "./async.utils";
import { performKeplrTx } from "./cosmos/performKeplrTx";
import { getCosmosAPIEndpoint } from "./networks.utils";

// function will know if EVM or COSMOS tx to perform
// returns hash of tx
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
      return await performCosmosTransaction(tx, signer);
    case "KEPLR":
      // perform keplr tx
      return await performKeplrTx(tx);
    default:
      return NEW_ERROR(
        "useTransactionStore::performSingleTransaction: unknown tx type"
      );
  }
}

// function type spcecifies how to check on the transaction
// will return if the transaction was successful/confirmed
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

export async function checkOnRightChain(
  signer: GetWalletClientResult,
  chainId: number
): PromiseWithError<boolean> {
  if (!signer) {
    return NEW_ERROR("checkOnRightChain: no signer");
  }
  if (signer.chain.id !== chainId) {
    try {
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
