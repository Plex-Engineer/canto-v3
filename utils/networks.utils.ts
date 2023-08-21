import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BaseNetwork } from "@/config/interfaces/networks";
import { Chain } from "@/config/interfaces/transactions";
import * as NETWORKS from "@/config/networks";
import * as COSMOS_NETWORKS from "@/config/networks/cosmos";

export function getNetworkInfoFromChainId(
  chainId: number | string
): ReturnWithError<BaseNetwork> {
  for (const [key, network] of Object.entries(NETWORKS)) {
    if (network.chainId === chainId) {
      return NO_ERROR(network);
    }
  }
  return NEW_ERROR("getNetworkInfoFromChainId: Network not found: " + chainId);
}

export function getCosmosAPIEndpoint(
  chainId: number | string
): ReturnWithError<string> {
  if (typeof chainId === "number") {
    // if number is passed in, it must be one of the Canto EVM chains
    switch (chainId) {
      case NETWORKS.CANTO_MAINNET_EVM.chainId:
        return NO_ERROR(COSMOS_NETWORKS.CANTO_MAINNET_COSMOS.restEndpoint);
      case NETWORKS.CANTO_TESTNET_EVM.chainId:
        return NO_ERROR(COSMOS_NETWORKS.CANTO_TESTNET_COSMOS.restEndpoint);
      default:
        return NEW_ERROR("getCosmosAPIEndpoint: Invalid chainId: " + chainId);
    }
  } else {
    for (const [key, network] of Object.entries(COSMOS_NETWORKS)) {
      if (network.chainId === chainId) {
        return NO_ERROR(network.restEndpoint);
      }
    }
    return NEW_ERROR("getCosmosAPIEndpoint: Network not found: " + chainId);
  }
}

// should only be used on canto chain since used for EIP712 context
export function getCosmosChainObject(chainId: number): ReturnWithError<Chain> {
  switch (chainId) {
    case NETWORKS.CANTO_TESTNET_EVM.chainId:
      return NO_ERROR({
        chainId: NETWORKS.CANTO_TESTNET_EVM.chainId,
        cosmosChainId: COSMOS_NETWORKS.CANTO_TESTNET_COSMOS.chainId,
      });
    case NETWORKS.CANTO_MAINNET_EVM.chainId:
      return NO_ERROR({
        chainId: NETWORKS.CANTO_MAINNET_EVM.chainId,
        cosmosChainId: COSMOS_NETWORKS.CANTO_MAINNET_COSMOS.chainId,
      });
    default:
      return NEW_ERROR("getCosmosChainObject: Invalid chainId:" + chainId);
  }
}
