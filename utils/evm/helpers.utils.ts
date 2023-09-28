import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import * as NETWORKS from "@/config/networks";
import Web3 from "web3";

/**
 * @notice gets rpc url from chainId
 * @param {number} chainId chainId to get rpc url for
 * @returns {ReturnWithError<string>} rpc url or error
 */
export function getRpcUrlFromChainId(chainId: number): ReturnWithError<string> {
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
export function getProviderWithoutSigner(rpcUrl: string): Web3 {
  return new Web3(rpcUrl);
}
