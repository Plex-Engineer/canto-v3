import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "./async.utils";
import { CANTO_MAINNET_COSMOS } from "@/config/networks";
import { isAddress as checkHex } from "web3-validator";
import { getCosmosAccount } from "./cosmos/transactions/helpers.utils";
import { getCosmosAPIEndpoint } from "./networks.utils";

/**
 * Convert an eth hex address to bech32 canto address.
 * @param {string} ethAddress The eth address to convert into a canto address
 * @return {string} The converted address
 */
export async function ethToCantoAddress(
  ethAddress: string
): PromiseWithError<string> {
  const { data: apiEndpoint, error: apiEndpointError } = getCosmosAPIEndpoint(
   CANTO_MAINNET_COSMOS.chainId
  );
  if (apiEndpointError) {
    return NEW_ERROR("ethToCantoAddress::" + apiEndpointError.message);
  }
  const { data: result, error } = await tryFetch<{ cosmos_address: string }>(
    apiEndpoint + "/ethermint/evm/v1/cosmos_account/" + ethAddress
  );
  if (error) {
    return NEW_ERROR("ethToCantoAddress::" + error.message);
  }
  if (!isValidCantoAddress(result.cosmos_address)) {
    return NEW_ERROR(
      "ethToCantoAddress: invalid canto address: " + result.cosmos_address
    );
  }
  return NO_ERROR(result.cosmos_address);
}

export async function checkPubKey(
  ethAddress: string,
  chainId: string
): PromiseWithError<boolean> {
  const { data: cosmosAccount, error } = await getCosmosAccount(
    ethAddress,
    chainId
  );
  if (error) {
    return NEW_ERROR("checkPubKey::" + error.message);
  }
  try {
    return NO_ERROR(
      cosmosAccount["account"]["base_account"]["pub_key"] != null
    );
  } catch (error) {
    return NEW_ERROR("checkPubKey::" + (error as Error).message);
  }
}

/**
 *
 * @param cantoAddress address to check
 * @returns if this is a valid canto address
 */
export function isValidCantoAddress(cantoAddress: string): boolean {
  return cantoAddress.startsWith("canto") && cantoAddress.length === 44;
}

export function isValidEthAddress(ethAddress: string): boolean {
  return checkHex(ethAddress);
}
