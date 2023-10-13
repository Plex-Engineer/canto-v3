import { isCantoChainId } from "@/utils/networks.utils";
import { NEW_ERROR, NO_ERROR, PromiseWithError, errMsg } from "../interfaces";
import { tryFetch } from "@/utils/async.utils";

// canto api
const cantoMainnetDataBaseUrl = process.env.NEXT_PUBLIC_CANTO_MAINNET_API_URL;
const cantoTestnetDataBaseUrl = process.env.NEXT_PUBLIC_CANTO_TESTNET_API_URL;

// get url from chainId
const CANTO_DATA_BASE_URL = (chainId: number) => {
  return chainId === 7701 ? cantoTestnetDataBaseUrl : cantoMainnetDataBaseUrl;
};

// exported endpoints
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
  allCTokens: "/v1/lending/cTokens",
  allPairs: "/v1/dex/pairs",
};
/**
 * @notice Gets data from Canto API
 * @param {number} chainId chainId to get data for
 * @param {string} endpointSuffix endpoint to get data from
 * @returns {PromiseWithError<T>} Optimistic response type
 */
export async function getCantoApiData<T>(
  chainId: number,
  endpointSuffix: string
): PromiseWithError<T> {
  if (!isCantoChainId(chainId)) {
    return NEW_ERROR("getCantoApiData: chainId not supported");
  }
  // get response from api
  const { data, error } = await tryFetch<{ block: string; results: string }>(
    CANTO_DATA_BASE_URL(chainId) + endpointSuffix
  );
  if (error) {
    return NEW_ERROR("getCantoApiData: " + errMsg(error));
  }
  // parse results string
  const parsedResults = JSON.parse(data.results) as T;
  return NO_ERROR(parsedResults);
}
