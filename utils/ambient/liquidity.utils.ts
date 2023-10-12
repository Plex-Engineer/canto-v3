import {
  baseTokenForConcLiq,
  liquidityForBaseConc,
  liquidityForQuoteConc,
  quoteTokenForConcLiq,
} from "@crocswap-libs/sdk";
import { convertToBigNumber } from "../tokenBalances.utils";
import {
  Q64_SCALE,
  convertFromQ64RootPrice,
  getPriceFromTick,
} from "./ambientMath.utils";
import { BigNumber } from "ethers";
import { percentOfAmount } from "../tokens/tokenMath.utils";

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
  return baseLiquidity.integerValue().toString();
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
  return quoteLiquidity.integerValue().toString();
}

/**
 * @notice gets optimal quote tokens from base token amount
 * @dev this will overestimate by 1% to ensure tx will go through
 * @param amount amount of base tokens wei
 * @params currentPrice current price wei
 * @param minPrice minimum price wei
 * @param maxPrice maximum price wei
 * @returns optimal quote tokens wei
 */
export function getConcQuoteTokensFromBaseTokens(
  amount: string,
  currentPrice: string,
  minPrice: string,
  maxPrice: string
): string {
  // check if zero
  if (Number(amount) === 0) {
    return "0";
  }
  const liquidity = liquidityForBaseConc(
    Number(currentPrice),
    BigNumber.from(amount),
    Number(minPrice),
    Number(maxPrice)
  );
  const quoteTokens = quoteTokenForConcLiq(
    Number(currentPrice),
    liquidity,
    Number(minPrice),
    Number(maxPrice)
  );
  // overestimate amount by 1%
  const quoteEstimate = percentOfAmount(quoteTokens.toString(), 101);
  if (quoteEstimate.error) {
    return "0";
  }
  return quoteEstimate.data.toString();
}

/**
 * @notice gets optimal base tokens from quote token amount
 * @dev this will overestimate by 1% to ensure tx will go through
 * @param amount amount of quote tokens wei
 * @params currentPrice current price wei
 * @param minPrice minimum price wei
 * @param maxPrice maximum price wei
 * @returns optimal base tokens wei
 */
export function getConcBaseTokensFromQuoteTokens(
  amount: string,
  currentPrice: string,
  minPrice: string,
  maxPrice: string
): string {
  // check if zero
  if (Number(amount) === 0) {
    return "0";
  }
  const liquidity = liquidityForQuoteConc(
    Number(currentPrice),
    BigNumber.from(amount),
    Number(minPrice),
    Number(maxPrice)
  );
  const baseTokens = baseTokenForConcLiq(
    Number(currentPrice),
    liquidity,
    Number(minPrice),
    Number(maxPrice)
  );
  // overestimate amount by 1%
  const baseEstimate = percentOfAmount(baseTokens.toString(), 101);
  if (baseEstimate.error) {
    return "0";
  }
  return baseEstimate.data.toString();
}

/**
 * @notice gets base token amount from range position
 * @param q64Price q64 price of base in quote
 * @param liquidity liquidity of position
 * @param lowerTick lower tick of position
 * @param upperTick upper tick of position
 * @returns base token amount
 */
export function baseTokenFromConcLiquidity(
  q64Price: string,
  liquidity: string,
  lowerTick: number,
  upperTick: number
): string {
  // convert price to wei
  const priceWei = convertFromQ64RootPrice(q64Price);
  // convert ticks to price
  const lowerPrice = getPriceFromTick(lowerTick);
  const upperPrice = getPriceFromTick(upperTick);
  // get base tokens
  const baseTokens = baseTokenForConcLiq(
    Number(priceWei),
    BigNumber.from(liquidity),
    Number(lowerPrice),
    Number(upperPrice)
  );
  return baseTokens.toString();
}

/**
 * @notice gets quote token amount from range position
 * @param q64Price q64 price of base in quote
 * @param liquidity liquidity of position
 * @param lowerTick lower tick of position
 * @param upperTick upper tick of position
 * @returns base token amount
 */
export function quoteTokenFromConcLiquidity(
  q64Price: string,
  liquidity: string,
  lowerTick: number,
  upperTick: number
): string {
  // convert price to wei
  const priceWei = convertFromQ64RootPrice(q64Price);
  // convert ticks to price
  const lowerPrice = getPriceFromTick(lowerTick);
  const upperPrice = getPriceFromTick(upperTick);
  // get quote tokens
  const quoteTokens = quoteTokenForConcLiq(
    Number(priceWei),
    BigNumber.from(liquidity),
    Number(lowerPrice),
    Number(upperPrice)
  );
  return quoteTokens.toString();
}
