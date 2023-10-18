import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import { AmbientPool } from "../interfaces/ambientPools";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";

const DEFAULT_TICK_RANGE = 75;

// This class is used for making calculations and displaying vales for
// adding concentrated liquidity in an ambient pool
export class AddAmbientConcLiqController {
  pool: AmbientPool;
  userSelections: UserSelections;
  constructor(pool: AmbientPool) {
    this.pool = pool;
    // use defaults for user selections
    const midpointPrice = pool.stats.lastPriceSwap;
    const midpointTick = getTickFromPrice(midpointPrice);
    const lowerTick = midpointTick - DEFAULT_TICK_RANGE;
    const upperTick = midpointTick + DEFAULT_TICK_RANGE;
    this.userSelections = {
      lowerTick,
      upperTick,
      minPriceWei: getPriceFromTick(lowerTick),
      midpointPriceWei: midpointPrice,
      maxPriceWei: getPriceFromTick(upperTick),
      amountBaseWei: "",
      amountQuoteWei: "",
      lastUpdatedToken: "base",
    };
  }

  /**  Setters */
  private setUserSelections(partialSelections: Partial<UserSelections>) {
    this.userSelections = {
      ...this.userSelections,
      ...partialSelections,
    };
  }

  /**  User Actions (all inputs are not in wei) */
  setAmount(amount: string, isBase: boolean) {
    // first check value before performing operations
    if (
      amount === "" ||
      isNaN(Number(amount)) ||
      !this.userSelections.minPriceWei ||
      !this.userSelections.maxPriceWei
    ) {
      this.setUserSelections({
        amountBaseWei: "",
        amountQuoteWei: "",
      });
      return;
    }
    // convert to wei
    const weiAmount =
      convertToBigNumber(
        amount,
        isBase ? this.pool.base.decimals : this.pool.quote.decimals
      ).data?.toString() ?? "0";
    // set amounts
    if (isBase) {
      // get quote estimate
      this.setUserSelections({
        amountBaseWei: weiAmount,
        amountQuoteWei: getConcQuoteTokensFromBaseTokens(
          weiAmount,
          this.pool.stats.lastPriceSwap,
          this.userSelections.minPriceWei,
          this.userSelections.maxPriceWei
        ),
        lastUpdatedToken: "base",
      });
    } else {
      this.setUserSelections({
        amountBaseWei: getConcBaseTokensFromQuoteTokens(
          weiAmount,
          this.pool.stats.lastPriceSwap,
          this.userSelections.minPriceWei,
          this.userSelections.maxPriceWei
        ),
        amountQuoteWei: weiAmount,
        lastUpdatedToken: "quote",
      });
    }
  }
  setMidpointPrice(price: string) {
    // first check value before performing operations
    if (price === "" || isNaN(Number(price)) || Number(price) <= 0) {
      this.setUserSelections({
        lowerTick: 0,
        upperTick: 0,
        minPriceWei: "0",
        midpointPriceWei: price,
        maxPriceWei: "0",
        amountBaseWei: "",
        amountQuoteWei: "",
      });
      return;
    }
  }
}

interface UserSelections {
  lowerTick: number;
  upperTick: number;
  minPriceWei: string;
  midpointPriceWei: string;
  maxPriceWei: string;
  amountBaseWei: string;
  amountQuoteWei: string;
  lastUpdatedToken: "base" | "quote";
}
