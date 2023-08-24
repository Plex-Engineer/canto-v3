import { ERC20Token, isERC20Token } from "@/config/interfaces/tokens";
import { BridgingMethod } from "./bridgeMethods";

export type BridgeToken = BridgeInToken | BridgeOutToken;

// BridgeIn and BridgeOut are the same thing, but with different bridging methods object
export type BridgeInToken = {
  bridgeMethods: BridgingMethod[];
} & (ERC20Token | IBCToken);
export type BridgeOutToken = {
  bridgeMethods: {
    chainId: string;
    methods: BridgingMethod[];
  }[];
} & (ERC20Token | IBCToken);

// extends ERC20 since all IBC tokens supported on Canto will have
// an ERC20 representation
export interface IBCToken extends Omit<ERC20Token, "address"> {
  address?: string;
  ibcDenom: string; // "ibc/..."
  nativeName: string; // ex. uatom, ucre, acanto
}

// for user balance data on bridge
export interface UserTokenBalances {
  [key: string]: string; // token id => balance
}

///
/// Functions to check token objects for type (type guarding)
///

/**
 * Checks if object is IBCToken
 * @param {object} object to check
 * @returns {boolean} true if object is IBCToken
 * @see IBCToken
 */
export function isIBCToken(object: any): object is IBCToken {
  return (
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

///
/// ** Bridge In Token Typeguards **
///

/**
 * Checks if object is BridgeInToken
 * @param {object} object to check
 * @returns {boolean} true if object is BridgeInToken
 * @see BridgeInToken
 */
export function isBridgeInToken(
  object: any
): object is BridgeInToken & BridgeToken {
  return (
    (isERC20Token(object) || isIBCToken(object)) &&
    "bridgeMethods" in object &&
    Array.isArray(object.bridgeMethods)
  );
}

/**
 * Checks if array is BridgeInToken[]
 * @param {object} array to check
 * @returns {boolean} true if array is BridgeInToken[]
 * @see BridgeInToken
 */
export function isBridgeInTokenList(
  array: Array<object>
): array is BridgeInToken[] & BridgeToken[] {
  return array.every(isBridgeInToken);
}

///
/// ** Bridge Out Token Typeguards **
///

/**
 * Checks if object is BridgeOutToken
 * @param {object} object to check
 * @returns {boolean} true if object is BridgeOutToken
 * @see BridgeOutToken
 */
export function isBridgeOutToken(
  object: any
): object is BridgeOutToken & BridgeToken {
  return (
    (isERC20Token(object) || isIBCToken(object)) &&
    "bridgeMethods" in object &&
    Array.isArray(object.bridgeMethods) &&
    object.bridgeMethods.every((method: object) => {
      return (
        "chainId" in method &&
        "methods" in method &&
        Array.isArray(method.methods)
      );
    })
  );
}

/**
 * Checks if array is BridgeOutToken[]
 * @param {object} array to check
 * @returns {boolean} true if array is BridgeOutToken[]
 * @see BridgeOutToken
 */
export function isBridgeOutTokenList(
  array: Array<object>
): array is BridgeOutToken[] & BridgeToken[] {
  return array.every(isBridgeOutToken);
}
