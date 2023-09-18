import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
  Transaction,
} from "@/config/interfaces";
import { GetWalletClientResult, writeContract } from "wagmi/actions";
import { checkOnRightChain } from "../baseTransaction.utils";
import { BaseError } from "viem";
import { Contract } from "web3";

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
  const { data: newSigner, error: chainError } = await checkOnRightChain(
    signer,
    tx.chainId
  );
  if (chainError || !newSigner) {
    return NEW_ERROR("performEVMTransaction::" + chainError);
  }

  try {
    const contractInstance = new Contract(tx.abi, tx.target, {
      provider: newSigner,
    });
    const transaction = await contractInstance.methods[tx.method](
      ...(tx.params as [])
    ).send({ from: newSigner.account.address, value: tx.value });
    if (!transaction.transactionHash) {
      return NEW_ERROR("performEVMTransaction: no tx hash");
    }
    return NO_ERROR(transaction.transactionHash as `0x${string}`);
  } catch (err) {
    if (err instanceof BaseError) {
      console.log(err.shortMessage);
      return NEW_ERROR("performEVMTransaction: " + err.shortMessage);
    }
    return NEW_ERROR("performEVMTransaction: " + errMsg(err));
  }

  // // try to sign tx
  // try {
  //   const contractCall = {
  //     address: tx.target as `0x${string}`,
  //     abi: tx.abi,
  //     functionName: tx.method,
  //     args: tx.params,
  //     value: BigInt(tx.value),
  //     chainId: tx.chainId,
  //     account: newSigner.account.address,
  //   };
  //   const { hash } = await writeContract(contractCall);
  //   return NO_ERROR(hash);
  // } catch (err) {
  //   if (err instanceof BaseError) {
  //     console.log(err.shortMessage);
  //     return NEW_ERROR("performEVMTransaction: " + err.shortMessage);
  //   }
  //   return NEW_ERROR("performEVMTransaction: " + errMsg(err));
  // }
}
