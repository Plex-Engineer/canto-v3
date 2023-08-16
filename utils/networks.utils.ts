import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BaseNetwork } from "@/config/interfaces/networks";
import * as NETWORKS from "@/config/networks";

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
