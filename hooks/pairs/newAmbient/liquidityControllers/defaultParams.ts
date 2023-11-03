import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import { AmbientPool } from "../interfaces/ambientPools";
import { formatBalance } from "@/utils/tokenBalances.utils";

/**
 * DEFAULT PARAMS FOR ADDING LIQUIDITY
 */
const DEFAULT_CONC_LIQ_TICK_RANGES = {
  DEFAULT: 75,
  NARROW: 60,
  WIDE: 100,
  CUSTOM: 0,
} as const;
// type for the keys
export type TickRangeKey = keyof typeof DEFAULT_CONC_LIQ_TICK_RANGES;
// array for the values
export const ALL_TICK_KEYS = Object.keys(
  DEFAULT_CONC_LIQ_TICK_RANGES
) as Array<TickRangeKey>;

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

// default price range from pool and tick key
export const defaultPriceRangeFormatted = (
  pool: AmbientPool,
  tickRange: TickRangeKey
) => {
  // get current price
  const midpointPrice = pool.stats.lastPriceSwap;
  const midpointTick = getTickFromPrice(midpointPrice);
  // lower tick and price
  const lowerTick = midpointTick - DEFAULT_CONC_LIQ_TICK_RANGES[tickRange];
  const minPriceFormatted = formatBalance(
    getPriceFromTick(lowerTick),
    pool.base.decimals - pool.quote.decimals,
    { precision: 5 }
  );
  // upper tick and price
  const upperTick = midpointTick + DEFAULT_CONC_LIQ_TICK_RANGES[tickRange];
  const maxPriceFormatted = formatBalance(
    getPriceFromTick(upperTick),
    pool.base.decimals - pool.quote.decimals,
    { precision: 5 }
  );
  return {
    minPriceFormatted,
    maxPriceFormatted,
  };
};
