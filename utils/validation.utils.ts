import { ValidationReturn } from "@/config/interfaces";
import { convertToBigNumber, formatBalance } from "./tokenBalances.utils";

/**
 * Validate input token amount
 * @param inputAmount input amount of token in big number format
 * @param maxAmount maximum amount of token in big number format
 * @param tokenDecimals amount of decimals in token
 * @returns {isValid: boolean, error: string}
 */
export function validateInputTokenAmount(
  inputAmount: string,
  maxAmount: string,
  tokenSymbol: string,
  tokenDecimals: number = 0
): ValidationReturn {
  /** Try to convert input to big number */
  const { data: bnInputAmount, error: bnError } =
    convertToBigNumber(inputAmount);
  if (bnError) {
    // most likely is not a number
    return { isValid: false, errorMessage: "invalid amount" };
  }

  /** Check if max is zero */
  if (Number(maxAmount) === 0) {
    return { isValid: false, errorMessage: "You have 0 balance" };
  }

  /** Check if input is too large */
  if (bnInputAmount.gt(maxAmount)) {
    return {
      isValid: false,
      errorMessage: `Amount must be less than ${formatBalance(
        maxAmount,
        tokenDecimals,
        { commify: true, symbol: tokenSymbol }
      )}`,
    };
  }

  /** Check if amount is too small */
  const minAmount = formatBalance("1", tokenDecimals, {
    precision: tokenDecimals,
  });
  if (bnInputAmount.lt(minAmount)) {
    return {
      isValid: false,
      errorMessage: `Amount must be greater than ${minAmount} ${tokenSymbol}`,
    };
  }
  /** All checks passed */
  return { isValid: true };
}
