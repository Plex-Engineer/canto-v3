import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { ethToCantoAddress } from ".";
import { getCosmosAccount } from "../cosmos/transactions/helpers.utils";

/**
 *
 * @dev will check the canto address representation of the ethAddress
 * @param {string} ethAddress User eth address
 * @param {string} chainId chainId to check pub key
 * @returns {boolean} true if the user has a pub key on the chain
 */
export async function checkPubKeyETH(
  ethAddress: string,
  chainId: string
): PromiseWithError<boolean> {
  try {
    // get canto address from eth address
    const { data: cantoAddress, error: ethToCantoError } =
      await ethToCantoAddress(ethAddress);
    if (ethToCantoError) throw ethToCantoError;

    // check pub key cosmos
    const { data: hasPubKey, error: checkPubKeyError } =
      await checkPubKeyCosmos(cantoAddress, chainId);
    if (checkPubKeyError) throw checkPubKeyError;

    // return true if the user has a pub key on the chain
    return NO_ERROR(hasPubKey);
  } catch (err) {
    return NEW_ERROR("checkPubKeyETH", err);
  }
}

/**
 *
 * @param {string} cosmosAddress cosmos address to check if public key exists
 * @param {string} chainId chainId to check public key on
 * @returns {boolean} true if the user has a pub key on the chain or error
 */
export async function checkPubKeyCosmos(
  cosmosAddress: string,
  chainId: string
): PromiseWithError<boolean> {
  try {
    // get comsos account from cosmos address
    const { data: cosmosAccount, error } = await getCosmosAccount(
      cosmosAddress,
      chainId
    );
    if (error) throw error;
    // return true if the user has a pub key on the chain
    return NO_ERROR(
      cosmosAccount["account"]["base_account"]["pub_key"] != null
    );
  } catch (err) {
    return NEW_ERROR("checkPubKeyCosmos", err);
  }
}
