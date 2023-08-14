import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import * as NETWORKS from "@/config/networks";
import Web3 from "web3";

export function getRpcUrlFromChainId(chainId: number): ReturnWithError<string> {
  for (const [key, network] of Object.entries(NETWORKS)) {
    if (network.chainId === chainId) {
      return NO_ERROR(network.rpcUrl);
    }
  }
  return NEW_ERROR("getRpcUrlFromChainId: invalid chainId: " + chainId);
}

export function getProviderWithoutSigner(rpcUrl: string): any {
  return new Web3(rpcUrl);
}

