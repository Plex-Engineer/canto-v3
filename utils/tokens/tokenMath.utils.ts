import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { convertToBigNumber } from "../formatBalances";
import BigNumber from "bignumber.js";

/**
 * @notice Converts a token amount to a $Note amount
 * @dev price must be scaled to 1e18 for precision
 * @dev decimals of token will already be accounted for by the price scale
 * @param {string} amount Amount of tokens
 * @param {string} price Price of token (scaled to 1e18)
 * @returns {ReturnWithError<string>} $Note amount
 */
export function convertTokenAmountToNote(
  amount: string,
  price: string
): ReturnWithError<BigNumber> {
  // convert everything to bigNumber for precision
  const [amountBN, priceBN] = [
    convertToBigNumber(amount),
    convertToBigNumber(price),
  ];
  if (amountBN.error || priceBN.error)
    return NEW_ERROR("convertTokenAmountToNote: Invalid amount or price");

  // calculate note amount
  const noteAmount = amountBN.data.times(priceBN.data).div(10 ** 18);

  return NO_ERROR(noteAmount);
}
