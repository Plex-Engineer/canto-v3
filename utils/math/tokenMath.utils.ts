import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { convertToBigNumber } from "@/utils/formatting";
import BigNumber from "bignumber.js";

/**
 * @notice Converts a token amount to a $Note amount
 * @dev price must be scaled to 1e18 for precision
 * @dev decimals of token will already be accounted for by the price scale
 * @param {string} tokenAmount Amount of tokens
 * @param {string} price Price of token (scaled to 1e18)
 * @returns {ReturnWithError<string>} $Note amount
 */
export function convertTokenAmountToNote(
  tokenAmount: string,
  price: string
): ReturnWithError<BigNumber> {
  // convert everything to bigNumber for precision
  const [amountBN, priceBN] = [
    convertToBigNumber(tokenAmount),
    convertToBigNumber(price),
  ];
  if (amountBN.error || priceBN.error || priceBN.data.isZero())
    return NEW_ERROR("convertTokenAmountToNote: Invalid amount or price");

  // calculate note amount
  const noteAmount = amountBN.data.times(priceBN.data).div(10 ** 18);

  return NO_ERROR(noteAmount);
}

/**
 * @notice Converts a $Note amount to a token amount
 * @dev price must be scaled to 1e18 for precision
 * @dev decimals of token will already be accounted for by the price scale
 * @param {string} noteAmount Amount of $Note
 * @param {string} price Price of token (scaled to 1e18)
 * @returns {ReturnWithError<string>} Token amount
 */
export function convertNoteAmountToToken(
  noteAmount: string,
  price: string
): ReturnWithError<BigNumber> {
  // convert everything to bigNumber for precision
  const [amountBN, priceBN] = [
    convertToBigNumber(noteAmount),
    convertToBigNumber(price),
  ];
  if (amountBN.error || priceBN.error || priceBN.data.isZero())
    return NEW_ERROR("convertNoteAmountToToken: Invalid amount or price");

  // calculate note amount
  const tokenAmount = amountBN.data.times(10 ** 18).div(priceBN.data);

  return NO_ERROR(tokenAmount);
}

/**
 * @notice Gets the percent of an amount
 * @param {string} amount Amount to get percent of
 * @param {number} percent Percent to get
 * @returns {ReturnWithError<string>} Percent of amount
 */
export function percentOfAmount(
  amount: string,
  percent: number
): ReturnWithError<string> {
  // convert everything to bigNumber for precision
  const amountBN = convertToBigNumber(amount);
  if (amountBN.error) return NEW_ERROR("getPercentOfAmount: Invalid amount");

  // calculate percent of amount
  const percentOfAmount = amountBN.data.times(percent).div(100);

  return NO_ERROR(percentOfAmount.integerValue().toString());
}

/**
 * @notice adds two token balances
 * @dev must be from the same token to keep decimals
 * @param {string} amount1 first amount to add
 * @param {string} amount2 second amount to add
 * @returns {string} sum of the two amounts
 */
export function addTokenBalances(amount1: string, amount2: string): string {
  const [amount1BN, amount2BN] = [
    convertToBigNumber(amount1),
    convertToBigNumber(amount2),
  ];
  if (amount1BN.error || amount2BN.error) return "0";
  return amount1BN.data.plus(amount2BN.data).toString();
}

/**
 * @notice subtracts two token balances
 * @dev must be from the same token to keep decimals
 * @param {string} amount1 first amount to subtract from
 * @param {string} amount2 second amount to subtract
 * @returns {string} difference of the two amounts
 */
export function subtractTokenBalances(
  amount1: string,
  amount2: string
): string {
  const [amount1BN, amount2BN] = [
    convertToBigNumber(amount1),
    convertToBigNumber(amount2),
  ];
  if (amount1BN.error || amount2BN.error) return "0";
  return amount1BN.data.minus(amount2BN.data).toString();
}

/**
 * @notice divides token balances
 * @dev must be from the same token to keep decimals
 * @param {string} numerator numerator
 * @param {string} denominator denominator
 * @returns {string} quotient of the two amounts
 */
export function divideBalances(numerator: string, denominator: string): string {
  const [numeratorBN, denominatorBN] = [
    convertToBigNumber(numerator),
    convertToBigNumber(denominator),
  ];
  if (numeratorBN.error || denominatorBN.error || denominatorBN.data.isZero())
    return "0";
  return numeratorBN.data.div(denominatorBN.data).toString();
}

/**
 * @notice compares token balances
 * @dev if from the same token don't need to account for decimals
 * @param {string} amount1 first amount to compare in wei
 * @param {number} decimals1 decimals of first amount
 * @param {string} amount2 second amount to compare in wei
 * @param {number} decimals2 decimals of second amount
 * @returns {boolean} true if amount1 is greater than amount2
 */
export function greaterThan(
  amount1: string,
  amount2: string,
  decimals1?: number,
  decimals2?: number
): boolean {
  const [amount1BN, amount2BN] = [
    convertToBigNumber(amount1, decimals1 ? -decimals1 : decimals1),
    convertToBigNumber(amount2, decimals2 ? -decimals2 : decimals2),
  ];
  if (amount1BN.error || amount2BN.error) return false;
  return amount1BN.data.gt(amount2BN.data);
}

/**
 * @notice gets minimum string value
 * @param {string} amount1 first amount to compare
 * @param {string} amount2 second amount to compare
 * @returns {ReturnWithError<string>} minimum string amount
 */
export function minOf(
  amount1: string,
  amount2: string
): ReturnWithError<string> {
  const [amount1BN, amount2BN] = [
    convertToBigNumber(amount1),
    convertToBigNumber(amount2),
  ];
  if (amount1BN.error || amount2BN.error) return NEW_ERROR("Invalid amounts");
  return NO_ERROR(amount1BN.data.lt(amount2BN.data) ? amount1 : amount2);
}
