import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import { AmbientPool } from "./interfaces/ambientPools";
import { useState } from "react";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";
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
    midpointPrice: string;
    setAmount: (value: string, isBase: boolean) => void;
    setMidpointPrice: (value: string) => void;
  };
}

const DEFAULT_TICK_RANGE = 75;

// This hook is used for making calculations and displaying vales for
// adding concentrated liquidity in an ambient pool
export default function useAddAmbientLiquidityController(
  pool: AmbientPool
): ControllerReturn {
  /** INTERNAL STATE */
  const initialState = (): AddConcLiqParams => {
    // use defaults for user selections
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
  const [internalState, setInternalState] = useState<AddConcLiqParams>(
    initialState()
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
    // first check value before performing operations
    if (
      amount === "" ||
      isNaN(Number(amount)) ||
      !internalState.minPriceWei ||
      !internalState.maxPriceWei
    ) {
      setPartialInternalState({
        amountBaseWei: "",
        amountQuoteWei: "",
      });
      setUserAmountBase(isBase ? amount : "");
      setUserAmountQuote(isBase ? "" : amount);
      return;
    }
    // convert to wei
    const weiAmount =
      convertToBigNumber(
        amount,
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
        internalState.minPriceWei,
        internalState.maxPriceWei
      );
      baseEstimateWei = weiAmount;
    } else {
      // get base estimate
      baseEstimateWei = getConcBaseTokensFromQuoteTokens(
        weiAmount,
        pool.stats.lastPriceSwap,
        internalState.minPriceWei,
        internalState.maxPriceWei
      );
      quoteEstimateWei = weiAmount;
    }
    // set wei values and readable values
    setPartialInternalState({
      amountBaseWei: baseEstimateWei,
      amountQuoteWei: quoteEstimateWei,
      lastUpdatedToken: isBase ? "base" : "quote",
    });
    setUserAmountBase(
      isBase ? amount : formatBalance(baseEstimateWei, pool.base.decimals)
    );
    setUserAmountQuote(
      isBase ? formatBalance(quoteEstimateWei, pool.quote.decimals) : amount
    );
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
    // set values to state
    setPartialInternalState({
      lowerTick,
      upperTick,
      minPriceWei,
      midpointPriceWei,
      maxPriceWei,
    });
    // set human readable values with new prices
    setAmount(
      internalState.lastUpdatedToken === "base"
        ? userAmountBase
        : userAmountQuote,
      internalState.lastUpdatedToken === "base"
    );
  }

  return {
    addLiqParamsWei: internalState,
    externalState: {
      amountBase: userAmountBase,
      amountQuote: userAmountQuote,
      midpointPrice: userMidpointPrice,
      setAmount,
      setMidpointPrice,
    },
  };
}
