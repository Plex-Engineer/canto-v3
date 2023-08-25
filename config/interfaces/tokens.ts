export interface ERC20Token {
  id: string; // unique id (address is fine)
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  balance?: string;
}

// extends ERC20 since all IBC tokens supported on Canto will have
// an ERC20 representation
export interface IBCToken extends Omit<ERC20Token, "address"> {
  address?: string;
  ibcDenom: string; // "ibc/..."
  nativeName: string; // ex. uatom, ucre, acanto
}

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
  return (
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
  return array.every(isERC20Token);
}

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
