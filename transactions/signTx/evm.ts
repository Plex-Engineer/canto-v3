import { getAccount, getWalletClient, switchChain } from "@wagmi/core";
import { Transaction } from "../interfaces";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";
import { newContractInstance } from "@/utils/evm";
import { percentOfAmount } from "@/utils/math";
import { BaseError } from "viem";
import { Signer } from "@/hooks/helpers/useCantoSigner";
import { wagmiConfig } from "@/provider/rainbowProvider";
import { getNetworkInfoFromChainId, isEVMNetwork } from "@/utils/networks";
import Web3 from "web3";

const GAS_OVER_ESTIMATE = 120;
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
      GAS_OVER_ESTIMATE
    );
    if (gasError) throw gasError;

    const transaction = await contractInstance.methods[tx.method](
      ...(tx.params as [])
    ).send({
      from: tx.fromAddress,
      value: tx.value,
      gas: gasLimit,
    });
    if (!transaction.transactionHash)
      throw new Error("performEVMTransaction: no tx hash");

    return NO_ERROR(transaction.transactionHash as `0x${string}`);
  } catch (err) {
    if (err instanceof BaseError) {
      console.error(err.shortMessage);
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
): PromiseWithError<Signer> {
  try {
    // get current network
    const { chainId: currentChainId } = getAccount(wagmiConfig);
    if (!currentChainId) throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());

    // check chain id
    if (currentChainId !== chainId) {
      // switch chains
      const network = await switchChain(wagmiConfig, { chainId });
      if (!network || network.id !== chainId)
        throw new Error(TX_SIGN_ERRORS.SWITCH_CHAIN_ERROR());
    }

    // get signer
    const signer = await getWalletClient(wagmiConfig, { chainId });
    if (!signer) throw new Error(TX_SIGN_ERRORS.MISSING_SIGNER());

    // return signer
    return NO_ERROR(signer);
  } catch (err) {
    return NEW_ERROR("getEvmSignerOnChainId", err);
  }
}

export async function estimateGas(tx: Transaction): PromiseWithError<string> {
  try {
    if (tx.type !== "EVM")
      throw Error(TX_SIGN_ERRORS.INCORRECT_TX_TYPE(tx.type));

    if (typeof tx.chainId !== "number")
      throw Error(TX_SIGN_ERRORS.INVALID_CHAIN_ID(tx.chainId));

    const { data: network, error } = getNetworkInfoFromChainId(tx.chainId);
    if (error) throw error;
    if (!isEVMNetwork(network)) throw new Error("Invalid network");

    // get contract instance
    const { data: contractInstance, error: contractError } =
      newContractInstance<typeof tx.abi>(tx.chainId, tx.target, tx.abi);
    if (contractError) throw contractError;

    const gasEstimate = await contractInstance.methods[tx.method](
      ...(tx.params as [])
    ).estimateGas({
      from: tx.fromAddress,
      value: tx.value,
    });
    if (!gasEstimate) throw new Error("estimateGas: no gas estimate");

    const currentGasPrice = await new Web3(network.rpcUrl).eth.getGasPrice();
    if (!currentGasPrice) throw new Error("estimateGas: no gas price");

    return NO_ERROR(
      (
        (BigInt(gasEstimate) *
          BigInt(currentGasPrice) *
          BigInt(GAS_OVER_ESTIMATE)) /
        BigInt(100)
      ).toString()
    );
  } catch (err) {
    return NEW_ERROR("estimateGas", err);
  }
}
