import {
  GetWalletClientResult,
  getWalletClient,
  switchNetwork,
  getNetwork,
} from "wagmi/actions";
import { Transaction } from "../interfaces";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";
import { newContractInstance } from "@/utils/evm";
import { percentOfAmount } from "@/utils/math";
import { asyncCallWithTimeout } from "@/utils/async";
import { BaseError } from "viem";
import { TransactionReceipt } from "web3";
import { WalletClient } from "wagmi";

/**
 * @notice signs evm transaction
 * @param {Transaction} tx transaction to perform
 * @param {GetWalletClientResult} signer signer to sign transaction with
 * @returns {PromiseWithError<string>} txHash of transaction or error
 */
export async function signEVMTransaction(
  tx: Transaction
): PromiseWithError<`0x${string}`> {
  try {
    if (tx.type !== "EVM")
      throw Error(TX_SIGN_ERRORS.INCORRECT_TX_TYPE(tx.type));

    if (typeof tx.chainId !== "number")
      throw Error(TX_SIGN_ERRORS.INVALID_CHAIN_ID(tx.chainId));

    // get signer
    const { data: signer, error: signerError } = await getEvmSignerOnChainId(
      tx.chainId
    );
    if (signerError) throw signerError;

    // check that signer is the account that is supposed to sign the transaction
    if (signer.account.address !== tx.fromAddress)
      throw Error(
        TX_SIGN_ERRORS.INCORRECT_SIGNER(tx.fromAddress, signer.account.address)
      );

    // get contract instance
    const { data: contractInstance, error: contractError } =
      newContractInstance<typeof tx.abi>(tx.chainId, tx.target, tx.abi, {
        signer,
      });
    if (contractError) throw contractError;

    // estimate gas so that metamask can show gas fee
    const gasEstimate = await contractInstance.methods[tx.method](
      ...(tx.params as [])
    ).estimateGas({
      from: tx.fromAddress,
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
            from: tx.fromAddress,
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
 * @notice gets signer for correct chain and checks if signer is on the right chain
 * @param {number} chainId chainId signer should be on
 * @returns {PromiseWithError<WalletClient>} signer or error
 */
export async function getEvmSignerOnChainId(
  chainId: number
): PromiseWithError<WalletClient> {
  try {
    // get current network
    const currentNetwork = getNetwork();
    if (!currentNetwork) throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());

    // check chain id
    if (currentNetwork.chain?.id !== chainId) {
      // switch chains
      const network = await switchNetwork({ chainId });
      if (!network || network.id !== chainId)
        throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());
    }

    // get signer
    const signer = await getWalletClient({ chainId });
    if (!signer) throw new Error(TX_SIGN_ERRORS.MISSING_SIGNER());

    // return signer
    return NO_ERROR(signer);
  } catch (err) {
    return NEW_ERROR("getEvmSignerOnChainId", err);
  }
}
