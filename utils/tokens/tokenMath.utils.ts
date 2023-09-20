import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces";
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
