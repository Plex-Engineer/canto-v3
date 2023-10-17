import {
  baseTokenForConcLiq,
  liquidityForBaseConc,
  liquidityForQuoteConc,
  quoteTokenForConcLiq,
  roundForConcLiq,
} from "@crocswap-libs/sdk";
import { BigNumber } from "ethers";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  percentOfAmount,
} from "../tokens/tokenMath.utils";
import { getPriceFromTick } from "./ambientMath.utils";

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
  // check if zero or current price is below min price
  if (
    !amount ||
    Number(amount) === 0 ||
    Number(currentPrice) < Number(minPrice)
  ) {
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
  // check if zero or over max price
  if (
    !amount ||
    Number(amount) === 0 ||
    Number(currentPrice) > Number(maxPrice)
  ) {
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
 * @param liquidity liquidity of position
 * @param currentPriceWei price of base in quote
 * @param lowerTick lower tick of position
 * @param upperTick upper tick of position
 * @returns base token amount
 */
export function baseTokenFromConcLiquidity(
  liquidity: string,
  currentPriceWei: string,
  lowerTick: number,
  upperTick: number
): string {
  // convert ticks to price
  const lowerPrice = getPriceFromTick(lowerTick);
  const upperPrice = getPriceFromTick(upperTick);
  // get base tokens
  const baseTokens = baseTokenForConcLiq(
    Number(currentPriceWei),
    BigNumber.from(liquidity),
    Number(lowerPrice),
    Number(upperPrice)
  );
  return baseTokens.toString();
}

/**
 * @notice gets quote token amount from range position
 * @param liquidity liquidity of position
 * @param currentPriceWei  price of base in quote
 * @param lowerTick lower tick of position
 * @param upperTick upper tick of position
 * @returns base token amount
 */
export function quoteTokenFromConcLiquidity(
  liquidity: string,
  currentPriceWei: string,
  lowerTick: number,
  upperTick: number
): string {
  // convert ticks to price
  const lowerPrice = getPriceFromTick(lowerTick);
  const upperPrice = getPriceFromTick(upperTick);
  // get quote tokens
  const quoteTokens = quoteTokenForConcLiq(
    Number(currentPriceWei),
    BigNumber.from(liquidity),
    Number(lowerPrice),
    Number(upperPrice)
  );
  return quoteTokens.toString();
}

/**
 * @notice gets note amount from range position
 * @param liquidity liquidity of position
 * @param currentPriceWei  price of base in quote
 * @param lowerTick lower tick of position
 * @param upperTick upper tick of position
 * @param priceBase price of base token
 * @param priceQuote price of quote token
 * @returns note amount
 */
export function concLiquidityNoteValue(
  liquidity: string,
  currentPriceWei: string,
  lowerTick: number,
  upperTick: number,
  priceBase: string,
  priceQuote: string
): string {
  // get tokens from liquidity
  const baseTokens = baseTokenFromConcLiquidity(
    liquidity,
    currentPriceWei,
    lowerTick,
    upperTick
  );
  const quoteTokens = quoteTokenFromConcLiquidity(
    liquidity,
    currentPriceWei,
    lowerTick,
    upperTick
  );
  // get note from tokens
  const baseNote = convertTokenAmountToNote(baseTokens, priceBase);
  const quoteNote = convertTokenAmountToNote(quoteTokens, priceQuote);
  if (baseNote.error || quoteNote.error) {
    return "0";
  }
  // add note amounts
  const noteAmount = addTokenBalances(
    baseNote.data.toString(),
    quoteNote.data.toString()
  );
  return noteAmount;
}

/**
 * @notice rounds liquidity value to acceptable ambient tx value
 * @param liq liquidity value
 * @returns rounded liquidity value
 */
export function roundLiquidityForAmbientTx(liq: string): string {
  return roundForConcLiq(BigNumber.from(liq)).toString();
}
