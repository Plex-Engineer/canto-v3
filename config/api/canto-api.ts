import { isCantoChainId } from "@/utils/networks.utils";
import { NEW_ERROR, NO_ERROR, PromiseWithError, errMsg } from "../interfaces";
import { tryFetch } from "@/utils/async.utils";
import { CANTO_DATA_BASE_URL } from ".";

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
