import BigNumber from "bignumber.js";
import { convertToBigNumber } from "../tokenBalances.utils";

const Q64_SCALE = new BigNumber(2).pow(64);

/**
 * @notice converts a Q64 price to a string
 * @dev Will return how much base token is worth in quote token (not scaled)
 * @param {string} q64RootPrice price to convert
 * @returns {string} converted price
 */
export function convertFromQ64RootPrice(q64RootPrice: string): string {
  const { data: priceBN, error } = convertToBigNumber(q64RootPrice);
  if (error) {
    return "0";
  }
  // divide price by scale
  const priceScaled = priceBN.div(Q64_SCALE);
  // square price to get final value
  const priceFinal = priceScaled.times(priceScaled);
  // return as string
  return priceFinal.toString();
}

/**
 * @notice gets the amount of active base token liquidity
 * @param q64RootPrice q64 price of base in quote
 * @param rootLiquidity sqrt(x*y) of base and quote liquidity
 * @returns amount of active base token liquidity
 */
export function getBaseLiquidity(
  q64RootPrice: string,
  rootLiquidity: string
): string {
  const { data: priceBN, error } = convertToBigNumber(q64RootPrice);
  if (error) {
    return "0";
  }
  // divide price by scale
  const priceScaled = priceBN.div(Q64_SCALE);
  // don't square price, want square root
  const baseLiquidity = priceScaled.times(rootLiquidity);
  // return as string
  return baseLiquidity.toString();
}

/**
 * @notice gets the amount of active quote token liquidity
 * @param q64RootPrice q64 price of quote in quote
 * @param rootLiquidity sqrt(x*y) of quote and quote liquidity
 * @returns amount of active quote token liquidity
 */
export function getQuoteLiquidity(
  q64RootPrice: string,
  rootLiquidity: string
): string {
  const { data: priceBN, error } = convertToBigNumber(q64RootPrice);
  if (error || priceBN.isZero()) {
    return "0";
  }
  const { data: rootLiquidityBN, error: rootLiquidityError } =
    convertToBigNumber(rootLiquidity);
  if (rootLiquidityError) {
    return "0";
  }
  // divide price by scale
  const priceScaled = priceBN.div(Q64_SCALE);
  // don't square price, want square root
  const quoteLiquidity = rootLiquidityBN.dividedBy(priceScaled);
  // return as string
  return quoteLiquidity.toString();
}
