import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  errMsg,
} from "@/config/interfaces/errors";
import BigNumber from "bignumber.js";

export function convertToBigNumber(
  amount: string,
  decimals: number
): ReturnWithError<BigNumber> {
  try {
    // truncate the amount to the number of decimals
    const numberAmount = Number(amount).toFixed(decimals);
    const bigNumber = new BigNumber(numberAmount);
    const multiplier = new BigNumber(10).pow(decimals);
    const convertedAmount = bigNumber.multipliedBy(multiplier);
    return NO_ERROR(convertedAmount);
  } catch (err) {
    return NEW_ERROR("convertToBigNuber:" + errMsg(err));
  }
}

export function formatBalance(
  amount: string | BigNumber,
  decimals: number,
  options?: {
    symbol?: string;
    precision?: number;
    commify?: boolean;
  }
): string {
  const { symbol = "", precision = undefined, commify = false } = options || {};
  const bnAmount = new BigNumber(amount);
  const formattedAmount = bnAmount.dividedBy(new BigNumber(10).pow(decimals));
  // if precision is undefined, ret2 places after the first non-zero decimal
  const truncateAt =
    precision ??
    2 - Math.floor(Math.log(formattedAmount.toNumber()) / Math.log(10));
  // make sure truncateAt is a positive number
  const truncatedAmount = formattedAmount.toFixed(
    Math.max(0, isFinite(truncateAt) ? truncateAt : 0)
  );
  return (
    (commify
      ? truncatedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : truncatedAmount) +
    " " +
    symbol
  );
}
