import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces";
import * as NETWORKS from "@/config/networks";
import { GetWalletClientResult } from "wagmi/actions";
import Web3, { Contract, ContractAbi } from "web3";

/**
 * @notice gets rpc url from chainId
 * @param {number} chainId chainId to get rpc url for
 * @returns {ReturnWithError<string>} rpc url or error
 */
function getRpcUrlFromChainId(chainId: number): ReturnWithError<string> {
  for (const [key, network] of Object.entries(NETWORKS)) {
    if (network.chainId === chainId) {
      return NO_ERROR(network.rpcUrl);
    }
  }
  return NEW_ERROR("getRpcUrlFromChainId: invalid chainId: " + chainId);
}

/**
 * @notice gets provider with signer from rpc url
 * @param {string} rpcUrl rpc url to get provider with signer for
 * @returns {Web3} provider with signer
 */
function getProviderWithoutSigner(rpcUrl: string): Web3 {
  return new Web3(rpcUrl);
}

/**
 * @notice gets contract instance from abi, address, and chainId
 * @dev pass in signer to perform transactions with contract
 * @param {number} chainId chainId to get contract instance for
 * @param {string} address address of contract
 * @param {ContractAbi} abi abi of contract
 * @param {GetWalletClientResult} options.signer signer to sign transaction with
 * @returns {ReturnWithError<Contract<T>>} contract instance or error
 */
export function newContractInstance<T extends ContractAbi>(
  chainId: number,
  address: string,
  abi: ContractAbi,
  options?: {
    signer?: GetWalletClientResult;
  }
): ReturnWithError<Contract<T>> {
  const rpc = getRpcUrlFromChainId(chainId);
  if (rpc.error) return NEW_ERROR("newContractInstance", rpc.error);
  if (options?.signer) {
    return NO_ERROR(
      new Contract(abi, address, {
        provider: options.signer,
      })
    );
  }
  const provider = getProviderWithoutSigner(rpc.data);
  return NO_ERROR(new Contract(abi, address, provider));
}

/**
 * @notice gets current block timestamp of chainId
 * @param {number} chainId chainId to get current block timestamp for
 * @returns {PromiseWithError<number>} current block timestamp or error
 */
export async function getEVMTimestamp(
  chainId: number
): PromiseWithError<number> {
  const { data: rpcUrl, error: rpcError } = getRpcUrlFromChainId(chainId);
  if (rpcError) return NEW_ERROR("getEVMTimestamp", rpcError);
  const provider = getProviderWithoutSigner(rpcUrl);
  const blockNumber = await provider.eth.getBlockNumber();
  const block = await provider.eth.getBlock(blockNumber);
  return NO_ERROR(Number(block.timestamp));
}
