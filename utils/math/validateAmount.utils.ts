import { USER_INPUT_ERRORS } from "@/config/consts/errors";
import { Validation } from "@/config/interfaces";
import { convertToBigNumber, formatBalance } from "@/utils/formatting";

/**
 * @description Validate wei input token amount
 * @param amountWei input amount of token in wei
 * @param minAmountWei minimum amount of token in wei
 * @param maxAmountWei maximum amount of token in wei
 * @param tokenSymbol symbol of token
 * @param tokenDecimals amount of decimals in token
 * @returns {Validation}
 */
export function validateWeiUserInputTokenAmount(
  amountWei: string,
  minAmountWei: string,
  maxAmountWei: string,
  tokenSymbol: string,
  tokenDecimals: number
): Validation {
  /** Try to convert input to big number no decimals */
  const { data: bnAmount, error: bnError } = convertToBigNumber(amountWei);
  if (bnError) {
    // user input is not a number
    return { error: true, reason: USER_INPUT_ERRORS.INVALID_INPUT() };
  }
  /** Check if max is zero */
  if (Number(maxAmountWei) === 0) {
    return { error: true, reason: USER_INPUT_ERRORS.NO_TOKEN_BALANCE() };
  }

  /** Check if input is too large */
  if (bnAmount.gt(maxAmountWei)) {
    return {
      error: true,
      reason: USER_INPUT_ERRORS.AMOUNT_TOO_HIGH(
        formatBalance(maxAmountWei, tokenDecimals, {
          commify: true,
        }),
        tokenSymbol
      ),
    };
  }

  /** Check if amount is too small */
  if (bnAmount.lt(minAmountWei)) {
    return {
      error: true,
      reason: USER_INPUT_ERRORS.AMOUNT_TOO_LOW(
        formatBalance(minAmountWei, tokenDecimals, {
          commify: true,
        }),
        tokenSymbol
      ),
    };
  }
  /** All checks passed */
  return { error: false };
}

/**
 * @description Validate user input token amount
 * @param userInputAmount input amount of token in NON wei (will convert in this function)
 * @param minAmount minimum amount of token in wei
 * @param maxAmount maximum amount of token in wei
 * @param tokenSymbol symbol of token
 * @param tokenDecimals amount of decimals in token
 * @returns {Validation}
 */
export function validateNonWeiUserInputTokenAmount(
  userInputAmount: string,
  minAmount: string,
  maxAmount: string,
  tokenSymbol: string,
  tokenDecimals: number
): Validation {
  /** Try to convert input to big number */
  const { data: bnInputAmount, error: bnError } = convertToBigNumber(
    userInputAmount,
    tokenDecimals
  );
  if (bnError) {
    // user input is not a number
    return { error: true, reason: USER_INPUT_ERRORS.INVALID_INPUT() };
  }
  /** Use wei in validateWeiUserInputTokenAmount*/
  return validateWeiUserInputTokenAmount(
    bnInputAmount.toString(),
    minAmount,
    maxAmount,
    tokenSymbol,
    tokenDecimals
  );
}
