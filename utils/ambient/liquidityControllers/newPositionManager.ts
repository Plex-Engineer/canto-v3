import { useState } from "react";
import {
  TickRangeKey,
  UserAddConcentratedLiquidityOptions,
  defaultPriceRangeFormatted,
} from "./defaultParams";
import BigNumber from "bignumber.js";
import {
  getDisplayTokenAmountFromRange,
  getTickFromPrice,
} from "@/utils/ambient";
import { convertToBigNumber } from "@/utils/formatting";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import {
  AmbientAddConcentratedLiquidityParams,
  AmbientTxType,
} from "@/transactions/pairs/ambient";

/**
 * @notice manages the cretion of a new ambient position
 * @dev this is used to calculate the optimal amount of tokens to add based on prices
 * @param pool ambient pool
 * @returns position manager
 */

export function useNewAmbientPositionManager(pool: AmbientPool) {
  /** EXTERNAL STATE WITH USER OPTIONS */
  const initialState = (): UserAddConcentratedLiquidityOptions => {
    const priceRange = defaultPriceRangeFormatted(pool, "DEFAULT");
    return {
      amountBase: "",
      amountQuote: "",
      lastUpdated: "base",
      minRangePrice: priceRange.minPriceFormatted,
      maxRangePrice: priceRange.maxPriceFormatted,
      minExecutionPrice: priceRange.minPriceFormatted,
      maxExecutionPrice: priceRange.maxPriceFormatted,
    };
  };
  const [userInputs, setUserInputs] =
    useState<UserAddConcentratedLiquidityOptions>(initialState());

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
    // make sure custom is not selected
    if (range === "CUSTOM") return;
    const priceRange = defaultPriceRangeFormatted(pool, range);
    setUserRangePrice({
      min: priceRange.minPriceFormatted,
      max: priceRange.maxPriceFormatted,
    });
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
      pool: pool,
      txType: AmbientTxType.ADD_CONC_LIQUIDITY,
      amount: amountWei,
      isAmountBase: baseAmount,
      upperTick,
      lowerTick,
      minExecPriceWei: executionPrices.minPriceWei,
      maxExecPriceWei: executionPrices.maxPriceWei,
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
      addLiquidity: createAddConcLiquidityTxParams,
    },
  };
}
