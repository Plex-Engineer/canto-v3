import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { getBridgeMethodInfo } from "@/transactions/bridge";
import {
  AnalyticsTransactionFlowInfo,
  AnalyticsTransactionFlowData,
  AnalyticsAmbientLPData,
  AnalyticsCantoLPData,
  AnalyticsLMData,
  AnalyticsStakingData,
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
import { getNetworkInfoFromChainId, isCantoChainId } from "@/utils/networks";
import { displayAmount, formatPercent } from "../formatting";
import { addTokenBalances } from "@/utils/math";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import {
  getDisplayTokenAmountFromRange,
  getPriceFromTick,
} from "@/utils/ambient";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import {
  StakingTransactionParams,
  StakingTxTypes,
} from "@/transactions/staking";
import { Validator } from "@/hooks/staking/interfaces/validators";

export function displayAnalyticsAmount(amount: string, decimals: number) {
  return displayAmount(amount, decimals, { short: false, precision: decimals < 0 ? 18 : decimals });
}

export function getAnalyticsTransactionFlowInfo(
  flow: NewTransactionFlow,
  flowId: string
): ReturnWithError<AnalyticsTransactionFlowInfo> {
  const txFlowInfo: AnalyticsTransactionFlowInfo = {
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
    case TransactionFlowType.STAKE_CANTO_TX:
      txFlowInfo.txFlowType = flow.params.txType;
      txFlowInfo.txFlowData = getStakingTransactionFlowData(flow.params);
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
    bridgeDirection: isCantoChainId(Number(bridgeTxParams.from.chainId))
      ? "OUT"
      : "IN",
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
    ambientLPPositionId: ambientLiquidityTxParams.positionId,
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
      ? displayAnalyticsAmount(
          ambientLiquidityTxParams.amount,
          ambientLiquidityTxParams.pool.base.decimals
        )
      : displayAnalyticsAmount(
          ambientLiquidityTxParams.amount,
          ambientLiquidityTxParams.pool.quote.decimals
        );
    const otherTokenAmount = getDisplayTokenAmountFromRange(
      nonWeiAmount,
      ambientLiquidityTxParams.isAmountBase,
      getPriceFromTick(ambientLiquidityTxParams.lowerTick),
      getPriceFromTick(ambientLiquidityTxParams.upperTick),
      ambientLiquidityTxParams.pool
    );
    const [baseAmount, quoteAmount] = [
      ambientLiquidityTxParams.isAmountBase ? nonWeiAmount : otherTokenAmount,
      ambientLiquidityTxParams.isAmountBase ? otherTokenAmount : nonWeiAmount,
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
      ambientLpIsAdvanced: ambientLiquidityTxParams.isAdvanced ?? false,
      ambientLpBaseAmount: baseAmount,
      ambientLpQuoteAmount: quoteAmount,
      ambientLpBaseBalance: baseBalance,
      ambientLpQuoteBalance: quoteBalance,
    };
  }
  // remove liquidity
  const [ambientLpExpectedBaseAmount, ambientLpExpectedQuoteAmount] = [
    displayAnalyticsAmount(
      ambientLiquidityTxParams.expectedBaseAmount ?? "0",
      ambientLiquidityTxParams.pool.base.decimals
    ),
    displayAnalyticsAmount(
      ambientLiquidityTxParams.expectedQuoteAmount ?? "0",
      ambientLiquidityTxParams.pool.quote.decimals
    ),
  ];
  return {
    ...poolData,
    ambientLpLiquidity: ambientLiquidityTxParams.liquidity,
    ambientLpExpectedBaseAmount,
    ambientLpExpectedQuoteAmount,
  };
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
  const lpTokenBlance = addTokenBalances(
    cantoDexTxParams.pair.clmData?.userDetails?.supplyBalanceInUnderlying ??
      "0",
    cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
  );
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
        cantoLpExpectedAmount1: displayAnalyticsAmount(
          cantoDexTxParams.expectedAmount1 ?? "0",
          cantoDexTxParams.pair.token1.decimals
        ),
        cantoLpExpectedAmount2: displayAnalyticsAmount(
          cantoDexTxParams.expectedAmount2 ?? "0",
          cantoDexTxParams.pair.token2.decimals
        ),
      };

    case CantoDexTxTypes.STAKE:
    case CantoDexTxTypes.UNSTAKE:
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
    case CTokenLendingTxTypes.SUPPLY:
    case CTokenLendingTxTypes.WITHDRAW:
      return {
        ...cTokenData,
        lmCollateralStatus: clmCTokenTxParams.cToken.userDetails?.isCollateral,
        lmSuppliedAmount: displayAnalyticsAmount(
          clmCTokenTxParams.cToken.userDetails?.supplyBalanceInUnderlying ??
            "0",
          clmCTokenTxParams.cToken.underlying.decimals
        ),
      };
    case CTokenLendingTxTypes.BORROW:
    case CTokenLendingTxTypes.REPAY:
      return {
        ...cTokenData,
        lmBorrowedAmount: displayAnalyticsAmount(
          clmCTokenTxParams.cToken.userDetails?.borrowBalance ?? "0",
          clmCTokenTxParams.cToken.underlying.decimals
        ),
      };
    case CTokenLendingTxTypes.COLLATERALIZE:
    case CTokenLendingTxTypes.DECOLLATERALIZE:
      return {
        lmToken: clmCTokenTxParams.cToken.underlying.symbol,
      };
    default:
      return {};
  }
}

function getStakingTransactionFlowData(
  stakingTxParams: StakingTransactionParams
): AnalyticsTransactionFlowData {
  switch (stakingTxParams.txType) {
    case StakingTxTypes.DELEGATE:
    case StakingTxTypes.UNDELEGATE:
      return {
        stakingValidator: stakingTxParams.validator.description.moniker,
        stakingDelegation: displayAnalyticsAmount(
          stakingTxParams.validator.userDelegation.balance ?? "0",
          18
        ),
        stakingAmount: displayAnalyticsAmount(
          stakingTxParams.amount ?? "0",
          18
        ),
        stakingWalletBalance: displayAnalyticsAmount(
          stakingTxParams.nativeBalance ?? "0",
          18
        ),
      };
    case StakingTxTypes.REDELEGATE:
      return {
        stakingValidator: stakingTxParams.validator.description.moniker,
        stakingDelegation: displayAnalyticsAmount(
          stakingTxParams.validator.userDelegation.balance ?? "0",
          18
        ),
        stakingAmount: displayAnalyticsAmount(
          stakingTxParams.amount ?? "0",
          18
        ),
        stakingNewValidator: stakingTxParams.newValidatorName,
      };
    case StakingTxTypes.CLAIM_REWARDS:
      return {};
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
  }
  return undefined;
}

export function getAnalyticsLendingMarketTokenInfo(
  lmType: string,
  cToken: CTokenWithUserData,
  liquidity: string,
  isSupply: boolean
): AnalyticsLMData {
  const cTokenData = {
    lmToken: cToken.underlying.symbol,
    lmWalletBalance: displayAnalyticsAmount(
      cToken.userDetails?.balanceOfUnderlying ?? "0",
      cToken.underlying.decimals
    ),
    lmAccountLiquidityRemaining: displayAnalyticsAmount(liquidity, 18),
  };
  if (isSupply) {
    return {
      ...cTokenData,
      lmSuppliedAmount: displayAnalyticsAmount(
        cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
        cToken.underlying.decimals
      ),
    };
  }
  return {
    ...cTokenData,
    lmBorrowedAmount: displayAnalyticsAmount(
      cToken.userDetails?.borrowBalance ?? "0",
      cToken.underlying.decimals
    ),
  };
}

export function getAnalyticsAmbientLiquidityPoolInfo(
  pool: AmbientPool
): AnalyticsAmbientLPData {
  const positions = pool.userPositions.map((position) => ({
    ambientLPPositionId: position.positionId,
    ambientLpLiquidity: position.concLiq,
    ambientLpMinRangePrice: displayAmount(
      getPriceFromTick(position.bidTick),
      pool.base.decimals - pool.quote.decimals,
      {
        short: false,
        precision: pool.base.decimals - pool.quote.decimals,
      }
    ),
    ambientLpMaxRangePrice: displayAmount(
      getPriceFromTick(position.askTick),
      pool.base.decimals - pool.quote.decimals,
      {
        short: false,
        precision: pool.base.decimals - pool.quote.decimals,
      }
    ),
  }));

  return {
    lpType: "AMBIENT",
    ambientLp: pool.symbol,
    ambientLPPositions: positions,
  };
}

export function getAnalyticsCantoLiquidityPoolInfo(
  pool: CantoDexPairWithUserCTokenData
): AnalyticsCantoLPData {
  return {
    lpType: "CANTO",
    cantoLp: pool.symbol,
    cantoLpTokenBalance: displayAmount(
      pool.clmData?.userDetails?.balanceOfUnderlying ?? "0",
      pool.decimals,
      { short: false, precision: pool.decimals }
    ),
    cantoLpStakedBalance: displayAmount(
      pool.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
      pool.decimals,
      { short: false, precision: pool.decimals }
    ),
    cantoLpUnstakedBalance: displayAmount(
      pool.clmData?.userDetails?.balanceOfUnderlying ?? "0",
      pool.decimals,
      { short: false, precision: pool.decimals }
    ),
  };
}

export function getAnalyticsStakingInfo(
  validator: Validator,
  delegation: string
): AnalyticsStakingData {
  return {
    stakingValidator: validator.description.moniker,
    stakingDelegation: displayAnalyticsAmount(delegation ?? "0", 18),
  };
}
