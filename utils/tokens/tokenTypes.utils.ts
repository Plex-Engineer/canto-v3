import { ERC20Token, IBCToken, OFTToken } from "@/config/interfaces";

///
/// Functions to check token objects for type (type guarding)
///

/**
 * Checks if object is ERC20Token
 * @param {object} object to check
 * @returns {boolean} true if object is ERC20Token
 * @see ERC20Token
 */
export function isERC20Token(object: any): object is ERC20Token {
  if (object === null || object === undefined) return false;
  return (
    typeof object === "object" &&
    "id" in object &&
    "chainId" in object &&
    "address" in object &&
    "name" in object &&
    "symbol" in object &&
    "decimals" in object &&
    "icon" in object
  );
}

/**
 * Checks if array is ERC20Token[]
 * @param {object} array to check
 * @returns {boolean} true if array is ERC20Token[]
 * @see ERC20Token
 */
export function isERC20TokenList(array: Array<object>): array is ERC20Token[] {
  if (array === null || array === undefined) return false;
  return array.every(isERC20Token);
}

/**
 * Checks if object is IBCToken
 * @param {object} object to check
 * @returns {boolean} true if object is IBCToken
 * @see IBCToken
 */
export function isIBCToken(object: any): object is IBCToken {
  if (object === null || object === undefined) return false;
  return (
    typeof object === "object" &&
    "id" in object &&
    "chainId" in object &&
    "name" in object &&
    "symbol" in object &&
    "decimals" in object &&
    "icon" in object &&
    "ibcDenom" in object &&
    "nativeName" in object
  );
}

export function isOFTToken(object: any): object is OFTToken {
  if (object === null || object === undefined) return false;
  return (
    isERC20Token(object) &&
    "isOFTProxy" in object &&
    "isOFT" in object &&
    object.isOFT === true
  );
}
