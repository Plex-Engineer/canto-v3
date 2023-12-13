import { isAddress as checkHex } from "web3-validator";

/**
 * @notice checks if a canto address is valid
 * @param {string} cantoAddress address to check
 * @returns {boolean} if a valid canto address
 */
export function isValidCantoAddress(cantoAddress: string): boolean {
  return cantoAddress.startsWith("canto") && cantoAddress.length === 44;
}

/**
 * @notice checks if an eth address is valid
 * @param {string} ethAddress address to check
 * @returns {boolean} if a valid eth address
 */
export function isValidEthAddress(ethAddress: string): ethAddress is `0x${string}` {
  return checkHex(ethAddress);
}

/**
 * @notice checks if two addresses are the same ignoring case
 * @param {string} a address to check
 * @param {string} b address to check
 * @returns {boolean} if addresses are the same
 */
export function areEqualAddresses(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
}

/**
 * @notice checks if a list of addresses includes an address ignoring case
 * @param {string[]} list list of addresses to check
 * @param {string} item address to check
 * @returns {boolean} if list includes address
 */
export function listIncludesAddress(list: string[], item: string): boolean {
  for (const listItem of list) {
    if (areEqualAddresses(listItem, item)) {
      return true;
    }
  }
  return false;
}
