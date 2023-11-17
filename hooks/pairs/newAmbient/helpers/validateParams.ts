import { Validation } from "@/config/interfaces";
import { AmbientAddConcentratedLiquidityParams } from "../interfaces/ambientPoolTxTypes";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  getPriceFromTick,
} from "@/utils/ambient";
import { USER_INPUT_ERRORS } from "@/config/consts/errors";
import { validateWeiUserInputTokenAmount } from "@/utils/math";

const invalidParams = (reason: string): Validation => ({ error: true, reason });
export function validateAddAmbientConcLiquidityParams(
  txParams: AmbientAddConcentratedLiquidityParams
): Validation {
  /** get current price to get expected amounts */
  const currentPrice = txParams.pool.stats.lastPriceSwap;
  /** check amount */
  if (Number(txParams.amount) === 0) {
    return invalidParams(
      USER_INPUT_ERRORS.AMOUNT_TOO_LOW(
        "0",
        txParams.isAmountBase
          ? txParams.pool.base.symbol
          : txParams.pool.quote.symbol
      )
    );
  }
  /** check base amount */
  const baseAmount = txParams.isAmountBase
    ? txParams.amount
    : getConcBaseTokensFromQuoteTokens(
        txParams.amount,
        currentPrice,
        getPriceFromTick(txParams.lowerTick),
        getPriceFromTick(txParams.upperTick)
      );
  const baseCheck = validateWeiUserInputTokenAmount(
    baseAmount,
    "0",
    txParams.pool.base.balance ?? "0",
    txParams.pool.base.symbol,
    txParams.pool.base.decimals
  );
  if (baseCheck.error) return baseCheck;

  /** check quote amount */
  const quoteAmount = txParams.isAmountBase
    ? getConcQuoteTokensFromBaseTokens(
        txParams.amount,
        currentPrice,
        getPriceFromTick(txParams.lowerTick),
        getPriceFromTick(txParams.upperTick)
      )
    : txParams.amount;
  const quoteCheck = validateWeiUserInputTokenAmount(
    quoteAmount,
    "0",
    txParams.pool.quote.balance ?? "0",
    txParams.pool.quote.symbol,
    txParams.pool.quote.decimals
  );
  if (quoteCheck.error) return quoteCheck;

  /** check execution prices */
  const executionPriceCheck = validateExecutionPrices(
    txParams.minPriceWei,
    txParams.maxPriceWei,
    currentPrice
  );
  if (executionPriceCheck.error) return executionPriceCheck;
  /** check ticks */
  if (txParams.lowerTick >= txParams.upperTick) {
    return invalidParams(USER_INPUT_ERRORS.RANGE_ERROR());
  }
  /** all checks passed */
  return { error: false };
}

export function validateExecutionPrices(
  minPriceWei: string,
  maxPriceWei: string,
  currentPriceWei: string
): Validation {
  if (Number(minPriceWei) < 0) {
    return invalidParams(USER_INPUT_ERRORS.EXECUTION_PRICE_TOO_LOW(true, "0"));
  }
  if (Number(maxPriceWei) < 0) {
    return invalidParams(USER_INPUT_ERRORS.EXECUTION_PRICE_TOO_LOW(false, "0"));
  }
  if (Number(minPriceWei) > Number(currentPriceWei)) {
    return invalidParams(
      USER_INPUT_ERRORS.EXECUTION_PRICE_TOO_HIGH(true, "the current price")
    );
  }
  if (Number(maxPriceWei) < Number(currentPriceWei)) {
    return invalidParams(
      USER_INPUT_ERRORS.EXECUTION_PRICE_TOO_LOW(false, "the current price")
    );
  }
  if (Number(minPriceWei) >= Number(maxPriceWei)) {
    return invalidParams(
      USER_INPUT_ERRORS.EXECUTION_PRICE_TOO_HIGH(true, "the max price")
    );
  }
  return { error: false };
}
