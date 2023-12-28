import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { getBridgeMethodInfo } from "@/transactions/bridge";
import {
  AnalyticsTransactionFlowInfo,
  AnalyticsTransactionFlowData,
} from "@/provider/analytics";
import { BridgeTransactionParams } from "@/transactions/bridge/types";
import {
  CantoDexTxTypes,
  CantoDexTransactionParams,
} from "@/transactions/pairs/cantoDex";
import {
  AmbientTxType,
  AmbientTransactionParams,
} from "@/transactions/pairs/ambient";
import {
  CTokenLendingTxTypes,
  CTokenLendingTransactionParams,
} from "@/transactions/lending";
import { ClaimDexComboRewardsParams } from "@/hooks/pairs/lpCombo/transactions/claimRewards";
import { getNetworkInfoFromChainId } from "@/utils/networks";
import { displayAmount, formatPercent } from "../formatting";
import { addTokenBalances } from "@/utils/math";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { getDisplayTokenAmountFromRange, getPriceFromTick } from "@/utils/ambient";

const displayAnalyticsAmount = (amount: string, decimals: number) =>
  displayAmount(amount, decimals, { short: false, precision: decimals });

export function getAnalyticsTransactionFlowInfo(
  flow: NewTransactionFlow,
  flowId: string
): ReturnWithError<AnalyticsTransactionFlowInfo> {
  let txFlowInfo: AnalyticsTransactionFlowInfo = {
    txFlowId: flowId,
    txFlowCategory: flow.txType,
    txCount: 0,
    txList: [],
  };

  switch (flow.txType) {
    case TransactionFlowType.BRIDGE: {
      txFlowInfo.txFlowType = getBridgeMethodInfo(flow.params.method).name;
      txFlowInfo.txFlowData = getBridgeTransactionFlowData(flow.params);
      break;
    }
    case TransactionFlowType.AMBIENT_LIQUIDITY_TX:
      txFlowInfo.txFlowType = flow.params.txType;
      txFlowInfo.txFlowData = getAmbientLiquidityTransactionFlowData(
        flow.params
      );
      break;
    case TransactionFlowType.CANTO_DEX_LP_TX:
      txFlowInfo.txFlowType = flow.params.txType;
      txFlowInfo.txFlowData = getCantoDexTransactionFlowData(flow.params);
      break;

    case TransactionFlowType.LP_COMBO_CLAIM_REWARDS_TX:
      txFlowInfo.txFlowType = getLpComboClaimRewardsTransactionFlowType(
        flow.params
      );
      break;
    case TransactionFlowType.CLM_CTOKEN_TX:
      txFlowInfo.txFlowType = flow.params.txType;
      txFlowInfo.txFlowData = getClmCTokenTransactionFlowData(flow.params);
      break;
    default:
      return NEW_ERROR("Invalid transaction flow type");
  }
  return NO_ERROR(txFlowInfo);
}

function getBridgeTransactionFlowData(
  bridgeTxParams: BridgeTransactionParams
): AnalyticsTransactionFlowData {
  return {
    bridgeFrom: getNetworkInfoFromChainId(bridgeTxParams.from.chainId).data
      .name,
    bridgeTo: getNetworkInfoFromChainId(bridgeTxParams.to.chainId).data.name,
    bridgeAsset: bridgeTxParams.token.data.symbol,
    bridgeAmount: displayAmount(
      bridgeTxParams.token.amount,
      bridgeTxParams.token.data.decimals,
      { short: false, precision: bridgeTxParams.token.data.decimals }
    ),
  };
}

function getAmbientLiquidityTransactionFlowData(
  ambientLiquidityTxParams: AmbientTransactionParams
): AnalyticsTransactionFlowData {
  const poolData = {
    ambientLp: ambientLiquidityTxParams.pool.symbol,
    ambientPositionId: ambientLiquidityTxParams.positionId,
    ambientLpBaseToken: ambientLiquidityTxParams.pool.base.symbol,
    ambientLpQuoteToken: ambientLiquidityTxParams.pool.quote.symbol,
    ambientLpCurrentPrice: displayAnalyticsAmount(
      ambientLiquidityTxParams.pool.stats.lastPriceSwap.toString(),
      ambientLiquidityTxParams.pool.base.decimals -
        ambientLiquidityTxParams.pool.quote.decimals 
    ),
    ambientLpMinRangePrice: displayAnalyticsAmount(
      getPriceFromTick(ambientLiquidityTxParams.lowerTick),
      ambientLiquidityTxParams.pool.base.decimals -
        ambientLiquidityTxParams.pool.quote.decimals
    ),
    ambientLpMaxRangePrice: displayAnalyticsAmount(
      getPriceFromTick(ambientLiquidityTxParams.upperTick),
      ambientLiquidityTxParams.pool.base.decimals -
        ambientLiquidityTxParams.pool.quote.decimals
    ),
    ambientLpMinExecPrice: displayAnalyticsAmount(
      ambientLiquidityTxParams.minExecPriceWei,
      ambientLiquidityTxParams.pool.base.decimals -
        ambientLiquidityTxParams.pool.quote.decimals
    ),
    ambientLpMaxExecPrice: displayAnalyticsAmount(
      ambientLiquidityTxParams.maxExecPriceWei,
      ambientLiquidityTxParams.pool.base.decimals -
        ambientLiquidityTxParams.pool.quote.decimals
    ),
    ambientLpFee: formatPercent(
      ambientLiquidityTxParams.pool.stats.feeRate.toString()
    ),
  };
  if (ambientLiquidityTxParams.txType === AmbientTxType.ADD_CONC_LIQUIDITY) {
    // add liquidity
    const nonWeiAmount = ambientLiquidityTxParams.isAmountBase
    ? displayAnalyticsAmount(ambientLiquidityTxParams.amount , ambientLiquidityTxParams.pool.base.decimals)
    : displayAnalyticsAmount(ambientLiquidityTxParams.amount , ambientLiquidityTxParams.pool.quote.decimals)
    const otherTokenAmount = getDisplayTokenAmountFromRange(
      nonWeiAmount,
      ambientLiquidityTxParams.isAmountBase,
      getPriceFromTick(ambientLiquidityTxParams.lowerTick),
      getPriceFromTick(ambientLiquidityTxParams.upperTick),
      ambientLiquidityTxParams.pool
    );
    const [baseAmount, quoteAmount] = [
      ambientLiquidityTxParams.isAmountBase
        ? nonWeiAmount
        : otherTokenAmount,
      ambientLiquidityTxParams.isAmountBase
        ? otherTokenAmount
        : nonWeiAmount
    ];

    const [baseBalance, quoteBalance] = [
      displayAnalyticsAmount(
        ambientLiquidityTxParams.pool.base.balance ?? "0",
        ambientLiquidityTxParams.pool.base.decimals
      ),
      displayAnalyticsAmount(
        ambientLiquidityTxParams.pool.quote.balance ?? "0",
        ambientLiquidityTxParams.pool.quote.decimals
      ),
    ];
    return {
      ...poolData,
      ambientLpBaseAmount: baseAmount,
      ambientLpQuoteAmount: quoteAmount,
      ambientLpBaseBalance: baseBalance,
      ambientLpQuoteBalance: quoteBalance,
    };
  } else {
    // remove liquidity
    return {
      ...poolData,
      ambientLpLiquidity: ambientLiquidityTxParams.liquidity,
    };
  }
}

function getCantoDexTransactionFlowData(
  cantoDexTxParams: CantoDexTransactionParams
): AnalyticsTransactionFlowData {
  const pairData = {
    cantoLp: cantoDexTxParams.pair.symbol,
    cantoLpToken1: cantoDexTxParams.pair.token1.symbol,
    cantoLpToken2: cantoDexTxParams.pair.token2.symbol,
    cantoLPBalance1: displayAnalyticsAmount(
      cantoDexTxParams.pair.token1.balance ?? "0",
      cantoDexTxParams.pair.token1.decimals
    ),
    cantoLPBalance2: displayAnalyticsAmount(
      cantoDexTxParams.pair.token2.balance ?? "0",
      cantoDexTxParams.pair.token2.decimals
    ),
  };
  switch (cantoDexTxParams.txType) {
    case CantoDexTxTypes.ADD_LIQUIDITY:
      return {
        ...pairData,
        cantoLpAmount1: displayAnalyticsAmount(
          cantoDexTxParams.amounts.amount1,
          cantoDexTxParams.pair.token1.decimals
        ),
        cantoLpAmount2: displayAnalyticsAmount(
          cantoDexTxParams.amounts.amount2,
          cantoDexTxParams.pair.token2.decimals
        ),
        cantoLpSlippage: cantoDexTxParams.slippage,
        cantoLpDeadline: cantoDexTxParams.deadline,
        cantoLpStakeStatus: cantoDexTxParams.stake,
      };
    case CantoDexTxTypes.REMOVE_LIQUIDITY:
      const lpTokenBlance = addTokenBalances(
        cantoDexTxParams.pair.clmData?.userDetails?.supplyBalanceInUnderlying ??
          "0",
        cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
      );
      return {
        ...pairData,
        cantoLpTokenAmount: displayAnalyticsAmount(
          cantoDexTxParams.amountLP ?? "0",
          cantoDexTxParams.pair.decimals
        ),
        cantoLpTokenBalance: displayAnalyticsAmount(
          lpTokenBlance,
          cantoDexTxParams.pair.decimals
        ),
        cantoLpSlippage: cantoDexTxParams.slippage,
        cantoLpDeadline: cantoDexTxParams.deadline,
        cantoLpExpectedToken1: displayAnalyticsAmount(
          cantoDexTxParams.expectedAmount1 ?? "0",
          cantoDexTxParams.pair.token1.decimals
        ),
        cantoLpExpectedToken2: displayAnalyticsAmount(
          cantoDexTxParams.expectedAmount2 ?? "0",
          cantoDexTxParams.pair.token2.decimals
        ),
      };

    case CantoDexTxTypes.STAKE || CantoDexTxTypes.UNSTAKE:
      return {
        ...pairData,
        cantoLpTokenAmount: displayAnalyticsAmount(
          cantoDexTxParams.amountLP,
          cantoDexTxParams.pair.decimals
        ),
        cantoLpTokenBalance: displayAnalyticsAmount(
          cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ??
            "0",
          cantoDexTxParams.pair.decimals
        ),
        cantoLpStakedBalance: displayAnalyticsAmount(
          cantoDexTxParams.pair.clmData?.userDetails
            ?.supplyBalanceInUnderlying ?? "0",
          cantoDexTxParams.pair.decimals
        ),
        cantoLpUnstakedBalance: displayAnalyticsAmount(
          cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ??
            "0",
          cantoDexTxParams.pair.decimals
        ),
      };
    default:
      return {};
  }
}

function getClmCTokenTransactionFlowData(
  clmCTokenTxParams: CTokenLendingTransactionParams
): AnalyticsTransactionFlowData {
  const cTokenData = {
    lmToken: clmCTokenTxParams.cToken.underlying.symbol,
    lmAmount: displayAnalyticsAmount(
      clmCTokenTxParams.amount,
      clmCTokenTxParams.cToken.underlying.decimals
    ),
    lmWalletBalance: displayAnalyticsAmount(
      clmCTokenTxParams.cToken.userDetails?.balanceOfUnderlying ?? "0",
      clmCTokenTxParams.cToken.underlying.decimals
    ),
    lmAccountLiquidityRemaining: displayAnalyticsAmount(
      clmCTokenTxParams.userPosition.liquidity,
      18
    ),
  };
  switch (clmCTokenTxParams.txType) {
    case CTokenLendingTxTypes.SUPPLY || CTokenLendingTxTypes.WITHDRAW:
      return {
        ...cTokenData,
        lmCollateralStatus: clmCTokenTxParams.cToken.userDetails?.isCollateral,
        lmSuppliedAmount: displayAnalyticsAmount(
          clmCTokenTxParams.cToken.userDetails?.supplyBalanceInUnderlying ??
            "0",
          clmCTokenTxParams.cToken.underlying.decimals
        ),
      };
    case CTokenLendingTxTypes.BORROW || CTokenLendingTxTypes.REPAY:
      return {
        ...cTokenData,
        lmBorrowedAmount: displayAnalyticsAmount(
          clmCTokenTxParams.cToken.userDetails?.borrowBalance ?? "0",
          clmCTokenTxParams.cToken.underlying.decimals
        ),
      };
    case CTokenLendingTxTypes.COLLATERALIZE ||
      CTokenLendingTxTypes.DECOLLATERALIZE: {
      return {
        lmToken: clmCTokenTxParams.cToken.underlying.symbol,
      };
    }
    default:
      return {};
  }
}

function getLpComboClaimRewardsTransactionFlowType(
  lpComboClaimRewardsTxParams: ClaimDexComboRewardsParams
): string | undefined {
  if (
    lpComboClaimRewardsTxParams.clmParams &&
    lpComboClaimRewardsTxParams.ambientParams
  ) {
    return "Claim Canto and Ambient Rewards";
  } else if (lpComboClaimRewardsTxParams.clmParams) {
    return "Claim Canto Rewards";
  } else if (lpComboClaimRewardsTxParams.ambientParams) {
    return "Claim Ambient Rewards";
  } else {
    return undefined;
  }
}
