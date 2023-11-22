import {
  GetWalletClientResult,
  getWalletClient,
  switchNetwork,
} from "wagmi/actions";
import { Transaction } from "../interfaces";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";
import { newContractInstance } from "@/utils/evm";
import { percentOfAmount } from "@/utils/math";
import { asyncCallWithTimeout } from "@/utils/async";
import { BaseError } from "viem";
import { TransactionReceipt } from "web3";

/**
 * @notice signs evm transaction
 * @param {Transaction} tx transaction to perform
 * @param {GetWalletClientResult} signer signer to sign transaction with
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function signEVMTransaction(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<`0x${string}`> {
  try {
    if (tx.type !== "EVM")
      throw Error(TX_SIGN_ERRORS.INCORRECT_TX_TYPE(tx.type));
    if (!signer) throw Error(TX_SIGN_ERRORS.MISSING_SIGNER());
    if (typeof tx.chainId !== "number")
      throw Error(TX_SIGN_ERRORS.INVALID_CHAIN_ID(tx.chainId));

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
  } catch (err) {
    if (err instanceof BaseError) {
      console.log(err.shortMessage);
      return NEW_ERROR("performEVMTransaction::" + err.shortMessage);
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
  try {
    if (!signer) throw new Error(TX_SIGN_ERRORS.MISSING_SIGNER());
    if (signer.chain.id !== chainId) {
      const network = await switchNetwork({ chainId });
      if (!network || network.id !== chainId) {
        throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());
      }
      const newSigner = await getWalletClient({ chainId });
      if (!newSigner) throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());
      return NO_ERROR(newSigner);
    }
    return NO_ERROR(signer);
  } catch (err) {
    return NEW_ERROR("checkOnRightChain", err);
  }
}
