import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";
import { GetWalletClientResult, writeContract } from "wagmi/actions";
import { checkOnRightChain } from "../baseTransaction.utils";

/**
 * @notice performs evm transaction
 * @param {Transaction} tx transaction to perform
 * @param {GetWalletClientResult} signer signer to sign transaction with
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function performEVMTransaction(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<`0x${string}`> {
  if (tx.type !== "EVM") {
    return NEW_ERROR("performEVMTransaction: not evm tx");
  }
  if (!signer) {
    return NEW_ERROR("performEVMTransaction: no signer");
  }
  if (typeof tx.chainId !== "number") {
    return NEW_ERROR("performEVMTransaction: invalid chainId: " + tx.chainId);
  }
  const { data: onRightChain, error: chainError } = await checkOnRightChain(
    signer,
    tx.chainId
  );
  if (chainError || !onRightChain) {
    return NEW_ERROR("performEVMTransaction::" + chainError);
  }

  // try to sign tx
  try {
    const contractCall = {
      address: tx.target as `0x${string}`,
      abi: tx.abi,
      functionName: tx.method,
      args: tx.params,
      value: BigInt(tx.value),
      chainId: tx.chainId,
      account: signer.account.address,
    };
    const { hash } = await writeContract(contractCall);
    return NO_ERROR(hash);
  } catch (error) {
    return NEW_ERROR("performEVMTransaction: " + (error as Error).message);
  }
}
