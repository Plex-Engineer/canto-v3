import { NEW_ERROR, NO_ERROR, ReturnWithError } from "../interfaces/errors";
import { Chain } from "../interfaces/transactions";
import { CANTO_MAINNET, CANTO_TESTNET } from "../networks";

export const CANTO_BOT_API_URL = "https://dust.plexnode.org/";
export const CANTO_DATA_API_URL = "https://canto-api-1.plexnode.wtf";
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
};

const CANTO_MAINNET_COSMOS_ENDPOINT = "https://mainnode.plexnode.org:1317";
const CANTO_TESTNET_COSMOS_ENDPOINT = "https://api-testnet.plexnode.wtf";

// should only be called on canto endpoints
export function getCosmosAPIEndpoint(chainId: number): ReturnWithError<string> {
  switch (chainId) {
    case CANTO_TESTNET.chainId:
      return NO_ERROR(CANTO_TESTNET_COSMOS_ENDPOINT);
    case CANTO_MAINNET.chainId:
      return NO_ERROR(CANTO_MAINNET_COSMOS_ENDPOINT);
    default:
      return NEW_ERROR("getCosmosAPIEndpoint: Invalid chainId");
  }
}

// should only be called on canto chain
export function getCosmosChainObj(chainId: number): ReturnWithError<Chain> {
  switch (chainId) {
    case CANTO_TESTNET.chainId:
      return NO_ERROR({
        chainId: Number(CANTO_TESTNET.chainId),
        cosmosChainId: "canto_7701-1",
      });
    case CANTO_MAINNET.chainId:
      return NO_ERROR({
        chainId: Number(CANTO_MAINNET.chainId),
        cosmosChainId: "canto_7700-1",
      });
    default:
      return NEW_ERROR("getCosmosChainObj: Invalid chainId");
  }
}
