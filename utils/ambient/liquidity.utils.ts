import {
  baseTokenForConcLiq,
  liquidityForBaseConc,
  liquidityForQuoteConc,
  quoteTokenForConcLiq,
} from "@crocswap-libs/sdk";
import { convertToBigNumber } from "../tokenBalances.utils";
import { Q64_SCALE } from "./ambientMath.utils";
import { BigNumber } from "ethers";

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

/**
 * @notice gets optimal quote tokens from base token amount
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

  return quoteTokens.toString();
}

/**
 * @notice gets optimal base tokens from quote token amount
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
  return baseTokens.toString();
}
