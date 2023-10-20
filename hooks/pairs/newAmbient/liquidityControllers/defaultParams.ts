import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import { AmbientPool } from "../interfaces/ambientPools";
import { formatBalance } from "@/utils/tokenBalances.utils";

/**
 * DEFAULT PARAMS FOR ADDING LIQUIDITY
 */

// Options User has to create new position
export interface UserAddConcentratedLiquidityOptions {
  amountBase: string;
  amountQuote: string;
  lastUpdated: "base" | "quote";
  minRangePrice: string;
  maxRangePrice: string;
  minExecutionPrice: string;
  maxExecutionPrice: string;
}
const DEFAULT_TICK_RANGE = 75;

export const defaultAddConcentratedLiquidtyParams = (
  pool: AmbientPool
): UserAddConcentratedLiquidityOptions => {
  // get current price
  const midpointPrice = pool.stats.lastPriceSwap;
  const midpointTick = getTickFromPrice(midpointPrice);
  // lower tick and price
  const lowerTick = midpointTick - DEFAULT_TICK_RANGE;
  const minPriceFormatted = formatBalance(
    getPriceFromTick(lowerTick),
    pool.base.decimals - pool.quote.decimals,
    { precision: 5 }
  );
  // upper tick and price
  const upperTick = midpointTick + DEFAULT_TICK_RANGE;
  const maxPriceFormatted = formatBalance(
    getPriceFromTick(upperTick),
    pool.base.decimals - pool.quote.decimals,
    { precision: 5 }
  );
  return {
    amountBase: "",
    amountQuote: "",
    lastUpdated: "base",
    minRangePrice: minPriceFormatted,
    maxRangePrice: maxPriceFormatted,
    minExecutionPrice: minPriceFormatted,
    maxExecutionPrice: maxPriceFormatted,
  };
};
