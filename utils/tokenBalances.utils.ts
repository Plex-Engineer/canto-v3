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
  const { symbol = "", precision = 2, commify = false } = options || {};
  const bigNumber = new BigNumber(amount);
  const multiplier = new BigNumber(10).pow(decimals);
  const formattedAmount = bigNumber.dividedBy(multiplier).toFixed(precision);
  return (
    (commify
      ? formattedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : formattedAmount) +
    " " +
    symbol
  );
}
