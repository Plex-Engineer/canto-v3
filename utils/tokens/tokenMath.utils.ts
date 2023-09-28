import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { convertToBigNumber } from "../tokenBalances.utils";
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
 * @param {number} percent Percent to get (0-100)
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

  return NO_ERROR(percentOfAmount.toFixed(0));
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
