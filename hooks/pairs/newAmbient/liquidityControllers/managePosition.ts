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
import { Validation } from "@/config/interfaces";
import {
  validateAddAmbientConcLiquidityParams,
  validateExecutionPrices,
} from "../helpers/validateParams";

// for adding to existing position, the only params we need are amount, isBase, and executon prices
// ticks already in the price range
// all props non-wei since coming directly from user inputs, will convert inside this class
type UserAddToExistingPositionParams = {
  nonWeiAmount: string;
  isBase: boolean;
  nonWeiMinExecutionPrice: string;
  nonWeiMaxExecutionPrice: string;
};
type UserRemoveFromExistingPositionParams = {
  percentToRemove: number;
  nonWeiMinExecutionPrice: string;
  nonWeiMaxExecutionPrice: string;
};

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

  createAddConcLiquidtyParams({
    nonWeiAmount,
    isBase,
    nonWeiMinExecutionPrice,
    nonWeiMaxExecutionPrice,
  }: UserAddToExistingPositionParams): AmbientAddConcentratedLiquidityParams {
    // convert amount to wei
    const amountWei =
      convertToBigNumber(
        nonWeiAmount,
        isBase ? this.pool.base.decimals : this.pool.quote.decimals
      ).data?.toString() ?? "0";
    // get execution prices in wei
    const minPriceWei = this.getWeiRangePrice(nonWeiMinExecutionPrice);
    const maxPriceWei = this.getWeiRangePrice(nonWeiMaxExecutionPrice);

    return {
      pool: this.pool,
      txType: AmbientTxType.ADD_CONC_LIQUIDITY,
      amount: amountWei,
      isAmountBase: isBase,
      lowerTick: this.position.bidTick,
      upperTick: this.position.askTick,
      minPriceWei,
      maxPriceWei,
    };
  }
  validateAddConcLiquidityParams(
    userParams: UserAddToExistingPositionParams
  ): Validation {
    return validateAddAmbientConcLiquidityParams(
      this.createAddConcLiquidtyParams(userParams)
    );
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

  createRemoveConcentratedLiquidtyParams({
    percentToRemove,
    nonWeiMinExecutionPrice,
    nonWeiMaxExecutionPrice,
  }: UserRemoveFromExistingPositionParams): AmbientRemoveConcentratedLiquidityParams {
    const liquidityToRemove = percentOfAmount(
      this.position.concLiq,
      percentToRemove
    );
    // get execution prices in wei
    const minPriceWei = this.getWeiRangePrice(nonWeiMinExecutionPrice);
    const maxPriceWei = this.getWeiRangePrice(nonWeiMaxExecutionPrice);
    return {
      txType: AmbientTxType.REMOVE_CONC_LIQUIDITY,
      pool: this.pool,
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

  validateRemoveConcLiquidityParams(
    userParams: UserRemoveFromExistingPositionParams
  ): Validation {
    // only check is if liquidity is greater than 0 and execution prices are valid
    if (userParams.percentToRemove <= 0 || userParams.percentToRemove > 100) {
      return {
        error: true,
        reason: "Invalid percent to remove",
      };
    }
    const txParams = this.createRemoveConcentratedLiquidtyParams(userParams);
    return validateExecutionPrices(
      txParams.minPriceWei,
      txParams.maxPriceWei,
      this.pool.stats.lastPriceSwap
    );
  }
}
