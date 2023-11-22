import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { AmbientTransactionParams, AmbientTxType } from "./types";
import {
  TX_DESCRIPTIONS,
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import {
  convertToQ64RootPrice,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  getPriceFromTick,
} from "@/utils/ambient";
import { percentOfAmount, validateWeiUserInputTokenAmount } from "@/utils/math";
import { getAmbientAddress } from "@/hooks/pairs/newAmbient/config/addresses";
import {
  _addAmbientConcLiquidityTx,
  _removeAmbientConcLiquidityTx,
} from "./txCreators";
import { createApprovalTxs } from "@/transactions/erc20";
import { isValidEthAddress } from "@/utils/address";

export async function ambientLiquidityTx(
  txParams: AmbientTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    const validation = validateAmbientLiquidityTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    // do all conversions here to pass into flows
    const minPriceQ64 = convertToQ64RootPrice(txParams.minExecPriceWei);
    const maxPriceQ64 = convertToQ64RootPrice(txParams.maxExecPriceWei);

    // get croc dex address
    const crocDexAddress = getAmbientAddress(txParams.chainId, "crocDex");
    if (!crocDexAddress)
      throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("chainId"));

    switch (txParams.txType) {
      case AmbientTxType.ADD_CONC_LIQUIDITY:
        return await addConLiquidity({
          ...txParams,
          crocDexAddress,
          minExecPriceQ64: minPriceQ64,
          maxExecPriceQ64: maxPriceQ64,
        });
      case AmbientTxType.REMOVE_CONC_LIQUIDITY:
        return NO_ERROR({
          transactions: [
            _removeAmbientConcLiquidityTx(
              txParams.chainId,
              crocDexAddress,
              txParams.pool.base.address,
              txParams.pool.quote.address,
              txParams.pool.poolIdx,
              txParams.liquidity,
              txParams.lowerTick,
              txParams.upperTick,
              minPriceQ64,
              maxPriceQ64,
              TX_DESCRIPTIONS.REMOVE_AMBIENT_CONC_LIQ()
            ),
          ],
        });
      default:
        throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("txType"));
    }
  } catch (err) {
    return NEW_ERROR("ambientLiquidityTx", err);
  }
}

type FormattedAmbientAddConcLiqParams = AmbientTransactionParams & {
  crocDexAddress: string;
  minExecPriceQ64: string;
  maxExecPriceQ64: string;
};
async function addConLiquidity(
  txParams: FormattedAmbientAddConcLiqParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** ensure correct tx type */
    if (txParams.txType !== AmbientTxType.ADD_CONC_LIQUIDITY)
      throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("txType"));

    /** create tx list */
    const txList: Transaction[] = [];

    /** estimate amounts of tokens needed for tx */
    let baseAmount: string;
    let quoteAmount: string;
    if (txParams.isAmountBase) {
      baseAmount = txParams.amount;
      quoteAmount = getConcQuoteTokensFromBaseTokens(
        txParams.amount,
        txParams.pool.stats.lastPriceSwap,
        getPriceFromTick(txParams.lowerTick),
        getPriceFromTick(txParams.upperTick)
      );
    } else {
      quoteAmount = txParams.amount;
      baseAmount = getConcBaseTokensFromQuoteTokens(
        txParams.amount,
        txParams.pool.stats.lastPriceSwap,
        getPriceFromTick(txParams.lowerTick),
        getPriceFromTick(txParams.upperTick)
      );
    }

    /** allowance check (approve 10% more for price changes) */
    const { data: baseApproval, error: baseApprovalError } = percentOfAmount(
      baseAmount,
      110
    );
    if (baseApprovalError) throw baseApprovalError;
    const { data: quoteApproval, error: quoteApprovalError } = percentOfAmount(
      quoteAmount,
      110
    );
    if (quoteApprovalError) throw quoteApprovalError;

    const { data: allowanceTxs, error: allowanceTxsError } =
      await createApprovalTxs(
        txParams.chainId,
        txParams.ethAccount,
        [
          {
            address: txParams.pool.base.address,
            symbol: txParams.pool.base.symbol,
          },
          {
            address: txParams.pool.quote.address,
            symbol: txParams.pool.quote.symbol,
          },
        ],
        [baseApproval, quoteApproval],
        { address: txParams.crocDexAddress, name: "Ambient" }
      );
    if (allowanceTxsError) throw allowanceTxsError;

    /** add allowance txs to list */
    txList.push(...allowanceTxs);

    /** add add liquidity tx */
    txList.push(
      _addAmbientConcLiquidityTx(
        txParams.chainId,
        txParams.crocDexAddress,
        txParams.pool.base.address,
        txParams.pool.quote.address,
        txParams.pool.poolIdx,
        txParams.isAmountBase ? baseAmount : quoteAmount,
        txParams.isAmountBase,
        txParams.lowerTick,
        txParams.upperTick,
        txParams.minExecPriceQ64,
        txParams.maxExecPriceQ64,
        TX_DESCRIPTIONS.ADD_AMBIENT_CONC_LIQ()
      )
    );

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("addConLiquidity", err);
  }
}

// make const for cleaner code
const invalidParams = (reason: string): Validation => ({
  error: true,
  reason,
});
export function validateAmbientLiquidityTxParams(
  txParams: AmbientTransactionParams
): Validation {
  /** check eth account */
  if (!isValidEthAddress(txParams.ethAccount)) {
    return invalidParams(TX_PARAM_ERRORS.PARAM_INVALID("ethAccount"));
  }
  /** validate based on tx type */
  /** get current price to get expected amounts */
  const currentPrice = txParams.pool.stats.lastPriceSwap;
  if (txParams.txType === AmbientTxType.ADD_CONC_LIQUIDITY) {
    /** check amount */
    if (Number(txParams.amount) === 0) {
      return invalidParams(
        TX_PARAM_ERRORS.AMOUNT_TOO_LOW(
          "0",
          txParams.isAmountBase
            ? txParams.pool.base.symbol
            : txParams.pool.quote.symbol
        )
      );
    }
    /** check base amount */
    const baseAmount = txParams.isAmountBase
      ? txParams.amount
      : getConcBaseTokensFromQuoteTokens(
          txParams.amount,
          currentPrice,
          getPriceFromTick(txParams.lowerTick),
          getPriceFromTick(txParams.upperTick)
        );
    const baseCheck = validateWeiUserInputTokenAmount(
      baseAmount,
      "0",
      txParams.pool.base.balance ?? "0",
      txParams.pool.base.symbol,
      txParams.pool.base.decimals
    );
    if (baseCheck.error) return baseCheck;

    /** check quote amount */
    const quoteAmount = txParams.isAmountBase
      ? getConcQuoteTokensFromBaseTokens(
          txParams.amount,
          currentPrice,
          getPriceFromTick(txParams.lowerTick),
          getPriceFromTick(txParams.upperTick)
        )
      : txParams.amount;
    const quoteCheck = validateWeiUserInputTokenAmount(
      quoteAmount,
      "0",
      txParams.pool.quote.balance ?? "0",
      txParams.pool.quote.symbol,
      txParams.pool.quote.decimals
    );
    if (quoteCheck.error) return quoteCheck;
  } else if (txParams.txType === AmbientTxType.REMOVE_CONC_LIQUIDITY) {
    /** check position information to remove from */
    const position = txParams.pool.userPositions.find(
      (position) => position.positionId === txParams.positionId
    );
    if (!position) {
      return invalidParams(
        TX_PARAM_ERRORS.POSITION_NOT_FOUND(txParams.positionId)
      );
    }
    /** check liquidity */
    if (Number(position.concLiq) < Number(txParams.liquidity)) {
      return invalidParams(
        TX_PARAM_ERRORS.AMOUNT_TOO_HIGH(position.concLiq, "liquidity")
      );
    }
  }

  /** check execution prices for add and remove */
  const executionPriceCheck = validateExecutionPrices(
    txParams.minExecPriceWei,
    txParams.maxExecPriceWei,
    currentPrice
  );
  if (executionPriceCheck.error) return executionPriceCheck;

  /** check ticks */
  if (txParams.lowerTick >= txParams.upperTick) {
    return invalidParams(TX_PARAM_ERRORS.RANGE_ERROR());
  }

  /** all checks passed */
  return { error: false };
}

function validateExecutionPrices(
  minPriceWei: string,
  maxPriceWei: string,
  currentPriceWei: string
): Validation {
  if (Number(minPriceWei) < 0) {
    return invalidParams(TX_PARAM_ERRORS.EXECUTION_PRICE_TOO_LOW(true, "0"));
  }
  if (Number(maxPriceWei) < 0) {
    return invalidParams(TX_PARAM_ERRORS.EXECUTION_PRICE_TOO_LOW(false, "0"));
  }
  if (Number(minPriceWei) > Number(currentPriceWei)) {
    return invalidParams(
      TX_PARAM_ERRORS.EXECUTION_PRICE_TOO_HIGH(true, "the current price")
    );
  }
  if (Number(maxPriceWei) < Number(currentPriceWei)) {
    return invalidParams(
      TX_PARAM_ERRORS.EXECUTION_PRICE_TOO_LOW(false, "the current price")
    );
  }
  if (Number(minPriceWei) >= Number(maxPriceWei)) {
    return invalidParams(
      TX_PARAM_ERRORS.EXECUTION_PRICE_TOO_HIGH(true, "the max price")
    );
  }
  return { error: false };
}
