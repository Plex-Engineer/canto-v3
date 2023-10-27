import { useState } from "react";
import { AmbientPool } from "../interfaces/ambientPools";
import {
  TickRangeKey,
  UserAddConcentratedLiquidityOptions,
  defaultAddConcentratedLiquidtyParams,
} from "./defaultParams";
import BigNumber from "bignumber.js";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  getDisplayTokenAmountFromRange,
} from "@/utils/ambient/liquidity.utils";
import {
  AmbientAddConcentratedLiquidityParams,
  AmbientTxType,
} from "../interfaces/ambientPoolTxTypes";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";
import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import { ValidationReturn } from "@/config/interfaces";

/**
 * @notice manages the cretion of a new ambient position
 * @dev this is used to calculate the optimal amount of tokens to add based on prices
 * @param pool ambient pool
 * @returns position manager
 */

export default function useNewAmbientPositionManager(pool: AmbientPool) {
  /** EXTERNAL STATE WITH USER OPTIONS */
  const [userInputs, setUserInputs] =
    useState<UserAddConcentratedLiquidityOptions>(
      defaultAddConcentratedLiquidtyParams(pool, "DEFAULT")
    );

  /** INTERNAL FUNCTIONS */

  // partial state setter for external state
  function setState(newState: Partial<UserAddConcentratedLiquidityOptions>) {
    setUserInputs((prev) => ({ ...prev, ...newState }));
  }

  // conversions for prices
  function getWeiRangePrices(
    minPriceFormatted: string,
    maxPriceFormatted: string
  ): { minPriceWei: string; maxPriceWei: string } {
    const scale = BigNumber(10).pow(pool.base.decimals - pool.quote.decimals);
    const minPriceWei = scale.multipliedBy(minPriceFormatted).toString();
    const maxPriceWei = scale.multipliedBy(maxPriceFormatted).toString();
    return { minPriceWei, maxPriceWei };
  }

  /** USER UPDATE FUNCTIONS */

  // function to set range to one of the default options
  function setDefaultParams(range: TickRangeKey) {
    setState(defaultAddConcentratedLiquidtyParams(pool, range));
  }

  // function to set execution price (will not update any other values)
  function setUserExecutionPrice(price: string, isMin: boolean) {
    setState(
      isMin ? { minExecutionPrice: price } : { maxExecutionPrice: price }
    );
  }

  // accepts user input for amount and sets other amount based on price
  function setUserAmount(amount: string, isBase: boolean) {
    // use internal state to fetch prices
    const currentPrices = getWeiRangePrices(
      userInputs.minRangePrice,
      userInputs.maxRangePrice
    );
    const newAmount = getDisplayTokenAmountFromRange(
      amount,
      isBase,
      currentPrices.minPriceWei,
      currentPrices.maxPriceWei,
      pool
    );
    setState({
      amountBase: isBase ? amount : newAmount,
      amountQuote: isBase ? newAmount : amount,
      lastUpdated: isBase ? "base" : "quote",
    });
  }

  // accepts user input for price and sets new amounts from price
  function setUserRangePrice(prices: { min?: string; max?: string }) {
    // get new amount from prices
    const lastUpdateBase = userInputs.lastUpdated === "base";
    const minPrice = prices.min ?? userInputs.minRangePrice;
    const maxPrice = prices.max ?? userInputs.maxRangePrice;
    const newWeiPrices = getWeiRangePrices(minPrice, maxPrice);
    // amount
    const amount = getDisplayTokenAmountFromRange(
      lastUpdateBase ? userInputs.amountBase : userInputs.amountQuote,
      lastUpdateBase,
      newWeiPrices.minPriceWei,
      newWeiPrices.maxPriceWei,
      pool
    );
    // set all new values
    setState({
      amountBase: lastUpdateBase ? userInputs.amountBase : amount,
      amountQuote: lastUpdateBase ? amount : userInputs.amountQuote,
      minRangePrice: minPrice,
      maxRangePrice: maxPrice,
    });
  }

  /** FUNCTION TO CREATE AND VERIFY TX PARAMS */

  // validate params to make sure they are valid (will not check user balances, just price ranges)
  const invalidParams = (reason: string) => ({
    isValid: false,
    errorMessage: reason,
  });
  function validateParams(): ValidationReturn {
    // create the txParams
    const txParams = createAddConcLiquidityTxParams();
    // get current price to compare ranges
    const currentPrice = pool.stats.lastPriceSwap;
    const currentTick = getTickFromPrice(currentPrice);
    // amount
    if (txParams.amount === "0") {
      return invalidParams("Amount cannot be 0");
    }
    const baseAmount = txParams.isAmountBase
      ? txParams.amount
      : getConcBaseTokensFromQuoteTokens(
          txParams.amount,
          currentPrice,
          getPriceFromTick(txParams.lowerTick),
          getPriceFromTick(txParams.upperTick)
        );
    const quoteAmount = txParams.isAmountBase
      ? getConcQuoteTokensFromBaseTokens(
          txParams.amount,
          currentPrice,
          getPriceFromTick(txParams.lowerTick),
          getPriceFromTick(txParams.upperTick)
        )
      : txParams.amount;
    if (Number(baseAmount) > Number(pool.base.balance)) {
      return invalidParams("Insufficient base balance");
    }
    if (Number(quoteAmount) > Number(pool.quote.balance)) {
      return invalidParams("Insufficient quote balance");
    }
    // execution prices
    if (txParams.minPriceWei === "0" || txParams.maxPriceWei === "0") {
      return invalidParams("Execution Price cannot be 0");
    }
    if (Number(txParams.minPriceWei) > Number(currentPrice)) {
      return invalidParams(
        "Minimum execution price is greater than current price"
      );
    }
    if (Number(txParams.maxPriceWei) < Number(currentPrice)) {
      return invalidParams(
        "Maximum execution price is less than current price"
      );
    }
    if (Number(txParams.minPriceWei) >= Number(txParams.maxPriceWei)) {
      return invalidParams("Minimum execution price is greater than maximum");
    }
    // ticks
    if (txParams.lowerTick >= txParams.upperTick) {
      return invalidParams("Lower price is greater than upper price");
    }
    if (txParams.lowerTick > currentTick || txParams.upperTick < currentTick) {
      return invalidParams(
        "Current price is not within range. Please update range"
      );
    }
    return {
      isValid: true,
    };
  }

  // uses internal state to create all wei values to pass into add liquidity tx
  function createAddConcLiquidityTxParams(): AmbientAddConcentratedLiquidityParams {
    // convert everything into wei
    const rangePrices = getWeiRangePrices(
      userInputs.minRangePrice,
      userInputs.maxRangePrice
    );
    const executionPrices = getWeiRangePrices(
      userInputs.minExecutionPrice,
      userInputs.maxExecutionPrice
    );
    const baseAmount = userInputs.lastUpdated === "base";
    const amountWei =
      convertToBigNumber(
        baseAmount ? userInputs.amountBase : userInputs.amountQuote,
        baseAmount ? pool.base.decimals : pool.quote.decimals
      ).data?.toString() ?? "0";

    // get ticks from range prices
    const lowerTick = getTickFromPrice(rangePrices.minPriceWei);
    const upperTick = getTickFromPrice(rangePrices.maxPriceWei);

    return {
      pair: pool,
      txType: AmbientTxType.ADD_CONC_LIQUIDITY,
      amount: amountWei,
      isAmountBase: baseAmount,
      upperTick,
      lowerTick,
      minPriceWei: executionPrices.minPriceWei,
      maxPriceWei: executionPrices.maxPriceWei,
    };
  }

  return {
    options: {
      ...userInputs,
    },
    setters: {
      setExecutionPrice: setUserExecutionPrice,
      setAmount: setUserAmount,
      setRangePrice: setUserRangePrice,
      setDefaultParams,
    },
    txParams: {
      validateParams,
      addLiquidity: createAddConcLiquidityTxParams,
    },
  };
}
