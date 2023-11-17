import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
} from "@/config/interfaces";
import {
  GetWalletClientResult,
  getWalletClient,
  switchNetwork,
} from "wagmi/actions";
import { BaseError } from "viem";
import { TransactionReceipt } from "web3";
import { asyncCallWithTimeout } from "../async";
import { newContractInstance } from "./contracts.utils";
import { percentOfAmount } from "../math";

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
  try {
    if (tx.type !== "EVM") throw Error("not evm tx");
    if (!signer) throw Error("no signer");
    if (typeof tx.chainId !== "number")
      throw Error("invalid chainId: " + tx.chainId);

    const { data: newSigner, error: chainError } = await checkOnRightChain(
      signer,
      tx.chainId
    );
    if (chainError || !newSigner) throw chainError;

    // get contract instance
    const { data: contractInstance, error: contractError } =
      newContractInstance<typeof tx.abi>(tx.chainId, tx.target, tx.abi, {
        signer: newSigner,
      });
    if (contractError) throw contractError;

    // estimate gas so that metamask can show gas fee
    const gasEstimate = await contractInstance.methods[tx.method](
      ...(tx.params as [])
    ).estimateGas({
      from: newSigner.account.address,
      value: tx.value,
    });
    // make sure gas is at least base limit (21,000), then over estimate by 50%
    const { data: gasLimit, error: gasError } = percentOfAmount(
      gasEstimate < 21000 ? "21000" : gasEstimate.toString(),
      150
    );
    if (gasError) throw gasError;
    // if user doesn't sign in 30 seconds, throw timeout error
    const { data: transaction, error: timeoutError } =
      await asyncCallWithTimeout<TransactionReceipt>(
        async () =>
          await contractInstance.methods[tx.method](...(tx.params as [])).send({
            from: newSigner.account.address,
            value: tx.value,
            gas: gasLimit,
          }),
        90000
      );
    if (timeoutError) throw timeoutError;
    if (!transaction.transactionHash)
      throw new Error("performEVMTransaction: no tx hash");

    return NO_ERROR(transaction.transactionHash as `0x${string}`);

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
  } catch (err) {
    if (err instanceof BaseError) {
      console.log(err.shortMessage);
      return NEW_ERROR("performEVMTransaction", err.shortMessage);
    }
    return NEW_ERROR("performEVMTransaction", err);
  }
}

/**
 * @notice checks if the signer is on the right chain and tries to switch if not
 * @dev for EVM wallets
 * @param {GetWalletClientResult} signer EVM signing wallet client
 * @param {number} chainId chainId signer should be on
 * @returns {PromiseWithError<GetWalletClientResult>} new signer if switch was made or error
 */
export async function checkOnRightChain(
  signer: GetWalletClientResult,
  chainId: number
): PromiseWithError<GetWalletClientResult> {
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
      const newSigner = await getWalletClient({ chainId });
      if (!newSigner) {
        // still some error getting the signer
        return NEW_ERROR("checkOnRightChain: error switching chains");
      }
      return NO_ERROR(newSigner);
    } catch (error) {
      return NEW_ERROR("checkOnRightChain: error switching chains");
    }
  }
  return NO_ERROR(signer);
}
