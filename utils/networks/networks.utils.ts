import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  BaseNetwork,
  CosmosNetwork,
  EVMNetwork,
} from "@/config/interfaces";
import * as NETWORKS from "@/config/networks";
import * as COSMOS_NETWORKS from "@/config/networks/cosmos";
import { Chain } from "@/transactions/interfaces";
import { getEthTransactionLink } from "@/config/networks/helpers";

const layerzeroMainnetScanUrl = "https://layerzeroscan.com";
const layerzeroTestnetScanUrl = "https://testnet.layerzeroscan.com";


export const getLayerZeroTransactionlink = (chainId: string | number) => {
  if (getNetworkInfoFromChainId(chainId).data.isTestChain) {
    return getEthTransactionLink(layerzeroTestnetScanUrl)
  }
  return getEthTransactionLink(layerzeroMainnetScanUrl)
}


// will get correct cosmos canto chain from evm or cosmos chain id
export function getCantoCosmosNetwork(
  chainId: number | string
): CosmosNetwork | null {
  if (
    chainId === NETWORKS.CANTO_MAINNET_EVM.chainId ||
    chainId === NETWORKS.CANTO_MAINNET_COSMOS.chainId
  ) {
    return COSMOS_NETWORKS.CANTO_MAINNET_COSMOS;
  } else if (
    chainId === NETWORKS.CANTO_TESTNET_EVM.chainId ||
    chainId === NETWORKS.CANTO_TESTNET_COSMOS.chainId
  ) {
    return COSMOS_NETWORKS.CANTO_TESTNET_COSMOS;
  } else {
    return null;
  }
}

export function isCantoChainId(chainId: number): boolean {
  return (
    chainId === NETWORKS.CANTO_MAINNET_EVM.chainId ||
    chainId === NETWORKS.CANTO_TESTNET_EVM.chainId
  );
}

/**
 * @notice checks if network is an EVM chain
 * @param {BaseNetwork} network network to check if EVM
 * @returns {boolean} true if network is an EVM chain
 */
export function isEVMNetwork(network: BaseNetwork): network is EVMNetwork {
  return typeof network.chainId === "number";
}

/**
 * @notice checks if network is a Cosmos chain
 * @param {BaseNetwork} network network to check if Cosmos
 * @returns {boolean} true if network is a Cosmos chain
 */
export function isCosmosNetwork(
  network: BaseNetwork
): network is CosmosNetwork {
  return typeof network.chainId === "string";
}

/**
 * @notice gets network object from chainId
 * @param {number | string} chainId chainId to get network object for
 * @returns {ReturnWithError<BaseNetwork>} network object or error
 */
export function getNetworkInfoFromChainId(
  chainId: number | string
): ReturnWithError<BaseNetwork> {
  for (const [key, network] of Object.entries(NETWORKS)) {
    if (network.chainId === chainId) {
      return NO_ERROR(network);
    }
  }
  return NEW_ERROR(
    "getNetworkInfoFromChainId",
    "Network not found: " + chainId
  );
}

/**
 * @notice gets cosmos rest endpoint from chainId
 * @dev can pass in canto evm chainId or canto cosmos chainId
 * @param {number | string} chainId chainId to get cosmos endpoint (must be a cosmos chain)
 * @returns {ReturnWithError<string>} rest endpoint for the chain or error if none found
 */
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
      case NETWORKS.GRAVITY_BRIGDE_EVM.chainId:
        return NO_ERROR(COSMOS_NETWORKS.GRAVITY_BRIDGE.restEndpoint);
      default:
        return NEW_ERROR("getCosmosAPIEndpoint", "Invalid chainId: " + chainId);
    }
  } else {
    for (const [key, network] of Object.entries(COSMOS_NETWORKS)) {
      if (network.chainId === chainId) {
        return NO_ERROR(network.restEndpoint);
      }
    }
    return NEW_ERROR("getCosmosAPIEndpoint", "Network not found: " + chainId);
  }
}

/**
 * @notice gets cosmos chain object from canto chainId
 * @dev should only be used on canto chain since used for EIP712 context
 * @param {number} chainId chainId to get cosmos chain object
 * @returns {ReturnWithError<Chain>} cosmos chain object or error
 */
export function getCosmosEIPChainObject(
  chainId: number
): ReturnWithError<Chain> {
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
    case NETWORKS.GRAVITY_BRIGDE_EVM.chainId:
      return NO_ERROR({
        chainId: NETWORKS.GRAVITY_BRIGDE_EVM.chainId,
        cosmosChainId: COSMOS_NETWORKS.GRAVITY_BRIDGE.chainId,
      });
    default:
      return NEW_ERROR("getCosmosEIPChainObject", "Invalid chainId:" + chainId);
  }
}
