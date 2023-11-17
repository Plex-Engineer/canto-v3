import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { CANTO_MAINNET_COSMOS } from "@/config/networks";
import { tryFetch } from "../async";
import { isValidCantoAddress } from ".";

/**
 * Convert an eth hex address to bech32 canto address.
 * @param {string} ethAddress The eth address to convert into a canto address
 * @return {string} The converted address
 */
export async function ethToCantoAddress(
  ethAddress: string
): PromiseWithError<string> {
  try {
    // chainId not important since address conversion is the same
    const apiEndpoint = CANTO_MAINNET_COSMOS.restEndpoint;

    // try to get canto account from eth address
    const { data: result, error } = await tryFetch<{ cosmos_address: string }>(
      apiEndpoint + "/ethermint/evm/v1/cosmos_account/" + ethAddress
    );
    if (error) throw error;

    // check if canto address is valid
    if (!isValidCantoAddress(result.cosmos_address))
      throw Error("invalid canto address: " + result.cosmos_address);

    return NO_ERROR(result.cosmos_address);
  } catch (err) {
    return NEW_ERROR("ethToCantoAddress", err);
  }
}
