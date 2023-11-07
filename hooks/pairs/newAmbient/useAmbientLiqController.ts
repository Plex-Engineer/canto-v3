import {
  getPriceFromTick,
  getTickFromPrice,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient";
import { AmbientPool, AmbientUserPosition } from "./interfaces/ambientPools";
import { useState } from "react";
import { convertToBigNumber, formatBalance } from "@/utils/formatting";
import BigNumber from "bignumber.js";

interface AddConcLiqParams {
  lowerTick: number;
  upperTick: number;
  minPriceWei: string;
  midpointPriceWei: string;
  maxPriceWei: string;
  amountBaseWei: string;
  amountQuoteWei: string;
  lastUpdatedToken: "base" | "quote";
}
interface ControllerReturn {
  addLiqParamsWei: AddConcLiqParams;
  externalState: {
    amountBase: string;
    amountQuote: string;
    setAmount: (value: string, isBase: boolean) => void;
    midpointPrice: string;
    setMidpointPrice: (value: string) => void;
  };
}

const DEFAULT_TICK_RANGE = 75;

// This hook is used for making calculations and displaying vales for
// adding concentrated liquidity in an ambient pool
export default function useAddAmbientLiquidityController(
  pool: AmbientPool,
  position?: AmbientUserPosition
): ControllerReturn {
  /** INTERNAL STATE */
  // default state if no position is passed
  const defaultState = (): AddConcLiqParams => {
    const midpointPrice = pool.stats.lastPriceSwap;
    const midpointTick = getTickFromPrice(midpointPrice);
    const lowerTick = midpointTick - DEFAULT_TICK_RANGE;
    const upperTick = midpointTick + DEFAULT_TICK_RANGE;
    return {
      lowerTick,
      upperTick,
      minPriceWei: getPriceFromTick(lowerTick),
      midpointPriceWei: midpointPrice,
      maxPriceWei: getPriceFromTick(upperTick),
      amountBaseWei: "0",
      amountQuoteWei: "0",
      lastUpdatedToken: "base",
    };
  };
  // default state if position is passed
  const defaultStateWithPosition = (
    pos: AmbientUserPosition
  ): AddConcLiqParams => ({
    lowerTick: pos.bidTick,
    upperTick: pos.askTick,
    minPriceWei: getPriceFromTick(pos.bidTick),
    midpointPriceWei: getPriceFromTick((pos.askTick + pos.bidTick) / 2),
    maxPriceWei: getPriceFromTick(pos.askTick),
    amountBaseWei: "0",
    amountQuoteWei: "0",
    lastUpdatedToken: "base",
  });

  const [internalState, setInternalState] = useState<AddConcLiqParams>(
    position ? defaultStateWithPosition(position) : defaultState()
  );
  /**  Internal Partial Setter */
  function setPartialInternalState(
    partialSelections: Partial<AddConcLiqParams>
  ) {
    setInternalState((prevState) => ({
      ...prevState,
      ...partialSelections,
    }));
  }

  /** EXTERNAL STATE AND FUNCTIONS */
  const [userAmountBase, setUserAmountBase] = useState<string>("");
  const [userAmountQuote, setUserAmountQuote] = useState<string>("");
  const [userMidpointPrice, setUserMidpointPrice] = useState<string>(
    formatBalance(
      pool.stats.lastPriceSwap,
      pool.base.decimals - pool.quote.decimals,
      {
        precision: 5,
      }
    )
  );
  // set non-wei amount
  function setAmount(amount: string, isBase: boolean) {
    // can use current state to get min/max prices
    const amounts = getTokenAmountsFromPrice(
      amount,
      isBase,
      internalState.minPriceWei,
      internalState.maxPriceWei,
      pool
    );
    // set internal state with new wei amounts
    setPartialInternalState({
      amountBaseWei: amounts.baseAmountWei,
      amountQuoteWei: amounts.quoteAmountWei,
      lastUpdatedToken: isBase ? "base" : "quote",
    });
    // set human readable values
    setUserAmountBase(amounts.baseAmountFormatted);
    setUserAmountQuote(amounts.quoteAmountFormatted);
  }

  // set non-wei price
  function setMidpointPrice(price: string) {
    // set readable value first
    setUserMidpointPrice(price);
    // first check value before performing operations
    if (price === "" || isNaN(Number(price)) || Number(price) <= 0) {
      setPartialInternalState({
        lowerTick: 0,
        upperTick: 0,
        minPriceWei: "0",
        midpointPriceWei: "0",
        maxPriceWei: "0",
        amountBaseWei: "0",
        amountQuoteWei: "0",
      });
      setUserAmountBase("");
      setUserAmountQuote("");
      return;
    }
    // convert to wei
    const midpointPriceWei = BigNumber(price)
      .multipliedBy(BigNumber(10).pow(pool.base.decimals - pool.quote.decimals))
      .toString();
    // get ticks from this price
    const midpointTick = getTickFromPrice(midpointPriceWei);
    const lowerTick = midpointTick - DEFAULT_TICK_RANGE;
    const upperTick = midpointTick + DEFAULT_TICK_RANGE;
    // get wei prices from ticks
    const minPriceWei = getPriceFromTick(lowerTick);
    const maxPriceWei = getPriceFromTick(upperTick);
    // get new amounts from price range
    const amounts = getTokenAmountsFromPrice(
      internalState.lastUpdatedToken === "base"
        ? userAmountBase
        : userAmountQuote,
      internalState.lastUpdatedToken === "base",
      minPriceWei,
      maxPriceWei,
      pool
    );
    // set values to internal state
    setPartialInternalState({
      lowerTick,
      upperTick,
      minPriceWei,
      midpointPriceWei,
      maxPriceWei,
      amountBaseWei: amounts.baseAmountWei,
      amountQuoteWei: amounts.quoteAmountWei,
    });
    // set human readable values
    setUserAmountBase(amounts.baseAmountFormatted);
    setUserAmountQuote(amounts.quoteAmountFormatted);
  }

  return {
    addLiqParamsWei: internalState,
    externalState: {
      amountBase: userAmountBase,
      amountQuote: userAmountQuote,
      setAmount,
      midpointPrice: userMidpointPrice,
      setMidpointPrice,
    },
  };
}

function getTokenAmountsFromPrice(
  nonWeiAmount: string,
  isBase: boolean,
  minPriceWei: string,
  maxPriceWei: string,
  pool: AmbientPool
): {
  baseAmountWei: string;
  baseAmountFormatted: string;
  quoteAmountWei: string;
  quoteAmountFormatted: string;
} {
  // first check value before performing operations
  if (
    nonWeiAmount === "" ||
    isNaN(Number(nonWeiAmount)) ||
    !minPriceWei ||
    !maxPriceWei
  ) {
    return {
      baseAmountWei: "0",
      baseAmountFormatted: isBase ? nonWeiAmount : "",
      quoteAmountWei: "0",
      quoteAmountFormatted: isBase ? "" : nonWeiAmount,
    };
  }
  // convert to wei
  const weiAmount =
    convertToBigNumber(
      nonWeiAmount,
      isBase ? pool.base.decimals : pool.quote.decimals
    ).data?.toString() ?? "0";
  let baseEstimateWei;
  let quoteEstimateWei;

  // get estimates
  if (isBase) {
    // get quote estimate
    quoteEstimateWei = getConcQuoteTokensFromBaseTokens(
      weiAmount,
      pool.stats.lastPriceSwap,
      minPriceWei,
      maxPriceWei
    );
    baseEstimateWei = weiAmount;
  } else {
    // get base estimate
    baseEstimateWei = getConcBaseTokensFromQuoteTokens(
      weiAmount,
      pool.stats.lastPriceSwap,
      minPriceWei,
      maxPriceWei
    );
    quoteEstimateWei = weiAmount;
  }
  // return all values
  return {
    baseAmountWei: baseEstimateWei,
    baseAmountFormatted: isBase
      ? nonWeiAmount
      : formatBalance(baseEstimateWei, pool.base.decimals),
    quoteAmountWei: quoteEstimateWei,
    quoteAmountFormatted: isBase
      ? formatBalance(quoteEstimateWei, pool.quote.decimals)
      : nonWeiAmount,
  };
}
