import {
  baseTokenFromConcLiquidity,
  getDisplayTokenAmountFromRange,
  quoteTokenFromConcLiquidity,
  roundLiquidityForAmbientTx,
  getPriceFromTick,
} from "@/utils/ambient";
import { AmbientPool, AmbientUserPosition } from "../interfaces/ambientPools";
import {
  AmbientAddConcentratedLiquidityParams,
  AmbientRemoveConcentratedLiquidityParams,
  AmbientTxType,
} from "../interfaces/ambientPoolTxTypes";
import { convertToBigNumber, formatBalance } from "@/utils/formatting";
import BigNumber from "bignumber.js";
import { percentOfAmount } from "@/utils/math";

// No states needed here, just functions to get the optimal amount of tokens to add/remove
export default class AmbientPositionManager {
  pool: AmbientPool;
  position: AmbientUserPosition;

  constructor(pool: AmbientPool, position: AmbientUserPosition) {
    this.pool = pool;
    this.position = position;
  }

  // display values for modals
  displayPositionValues() {
    return {
      lowerTick: this.position.bidTick,
      upperTick: this.position.askTick,
      lowerPrice: this.getFormattedPrice(
        getPriceFromTick(this.position.bidTick)
      ),
      upperPrice: this.getFormattedPrice(
        getPriceFromTick(this.position.askTick)
      ),
    };
  }

  //conversions for prices
  getWeiRangePrice(priceFormatted: string): string {
    const scale = BigNumber(10).pow(
      this.pool.base.decimals - this.pool.quote.decimals
    );
    const priceWei = scale.multipliedBy(priceFormatted).toString();
    return priceWei;
  }
  getFormattedPrice(priceWei: string): string {
    return formatBalance(
      priceWei,
      this.pool.base.decimals - this.pool.quote.decimals,
      { precision: 5 }
    );
  }

  /**
   * ADD LIQUIDITY
   */
  getAmountFromAmountFormatted(amount: string, isBase: boolean): string {
    // get wei prices from ticks
    const minPriceWei = getPriceFromTick(this.position.bidTick);
    const maxPriceWei = getPriceFromTick(this.position.askTick);
    return getDisplayTokenAmountFromRange(
      amount,
      isBase,
      minPriceWei,
      maxPriceWei,
      this.pool
    );
  }
  createAddConcLiquidtyParams(
    amount: string,
    isBase: boolean,
    executionPrice?: {
      minPriceFormatted?: string;
      maxPriceFormatted?: string;
    }
  ): AmbientAddConcentratedLiquidityParams {
    // convert amount to wei
    const amountWei =
      convertToBigNumber(
        amount,
        isBase ? this.pool.base.decimals : this.pool.quote.decimals
      ).data?.toString() ?? "0";
    // get execution prices
    const minPriceWei = executionPrice?.minPriceFormatted
      ? this.getWeiRangePrice(executionPrice.minPriceFormatted)
      : getPriceFromTick(this.position.bidTick);
    const maxPriceWei = executionPrice?.maxPriceFormatted
      ? this.getWeiRangePrice(executionPrice.maxPriceFormatted)
      : getPriceFromTick(this.position.askTick);
    return {
      pair: this.pool,
      txType: AmbientTxType.ADD_CONC_LIQUIDITY,
      amount: amountWei,
      isAmountBase: isBase,
      lowerTick: this.position.bidTick,
      upperTick: this.position.askTick,
      minPriceWei,
      maxPriceWei,
    };
  }

  /**
   * REMOVE LIQUIDITY
   */
  getExpectedRemovedTokens(percentToRemove: number): {
    base: string;
    quote: string;
  } {
    const liquidityToRemove = percentOfAmount(
      this.position.concLiq,
      percentToRemove
    );
    return {
      base: baseTokenFromConcLiquidity(
        liquidityToRemove.data?.toString() ?? "0",
        this.pool.stats.lastPriceSwap.toString(),
        this.position.bidTick,
        this.position.askTick
      ),
      quote: quoteTokenFromConcLiquidity(
        liquidityToRemove.data?.toString() ?? "0",
        this.pool.stats.lastPriceSwap.toString(),
        this.position.bidTick,
        this.position.askTick
      ),
    };
  }

  createRemoveConcentratedLiquidtyParams(
    percentToRemove: number,
    executionPrice?: {
      minPriceFormatted?: string;
      maxPriceFormatted?: string;
    }
  ): AmbientRemoveConcentratedLiquidityParams {
    const liquidityToRemove = percentOfAmount(
      this.position.concLiq,
      percentToRemove
    );
    // get execution prices
    const minPriceWei = executionPrice?.minPriceFormatted
      ? this.getWeiRangePrice(executionPrice.minPriceFormatted)
      : getPriceFromTick(this.position.bidTick);
    const maxPriceWei = executionPrice?.maxPriceFormatted
      ? this.getWeiRangePrice(executionPrice.maxPriceFormatted)
      : getPriceFromTick(this.position.askTick);
    return {
      txType: AmbientTxType.REMOVE_CONC_LIQUIDITY,
      pair: this.pool,
      liquidity: roundLiquidityForAmbientTx(
        liquidityToRemove.data?.toString() ?? "0"
      ),
      positionId: this.position.positionId,
      upperTick: this.position.askTick,
      lowerTick: this.position.bidTick,
      minPriceWei,
      maxPriceWei,
    };
  }
}
