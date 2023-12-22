import {NewTransactionFlow} from "@/transactions/flows";
import { TransactionFlowType } from "@/transactions/flows";
import  {getBridgeMethodInfo} from "@/transactions/bridge/types";
import {AnalyticsTransactionFlowInfo, AnalyticsTransactionFlowData} from "@/provider/analytics";
import { BridgeTransactionParams } from "@/transactions/bridge/types";
import { CantoDexTxTypes, CantoDexTransactionParams} from "@/transactions/pairs/cantoDex";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import {AmbientTxType, AmbientTransactionParams} from "@/transactions/pairs/ambient/types"
import {CTokenLendingTxTypes, CTokenLendingTransactionParams} from "@/transactions/lending/types"
import {ClaimDexComboRewardsParams} from "@/hooks/pairs/lpCombo/transactions/claimRewards"
import { getNetworkInfoFromChainId } from "@/utils/networks";
import { convertToBigNumber, displayAmount } from "../formatting";
import { addTokenBalances } from "@/utils/math";
import { quoteRemoveLiquidity } from "@/utils/cantoDex";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { NO_ERROR,PromiseWithError} from "@/config/interfaces/errors";

async function getQuote(amountLp: string, pair :  CantoDexPairWithUserCTokenData): PromiseWithError<{
  expectedToken1: string;
  expectedToken2: string;
}>{
    const { data, error } = await quoteRemoveLiquidity(
      Number(pair.token1.chainId),
      getCantoCoreAddress(Number(pair.token1.chainId), "router") ?? "",
      pair.token1.address,
      pair.token2.address,
      pair.stable,
      (convertToBigNumber(amountLp, pair.decimals).data ?? "0").toString()
    );

    if (error) {
      return NO_ERROR({
        expectedToken1: "0",
        expectedToken2: "0",
      });
    }
    return NO_ERROR({
      expectedToken1: data.expectedToken1 ?? "0",
      expectedToken2: data.expectedToken2 ?? "0",
    });
}

export async function getAnalyticsTransactionFlowInfo(flow : NewTransactionFlow, flowId: string) :  PromiseWithError< AnalyticsTransactionFlowInfo | undefined >{
    let txFlowInfo  : AnalyticsTransactionFlowInfo = {
      txFlowId: flowId,
      txFlowCategory: flow.txType,
      txCount:0,
      txList:[],
    }

    switch (flow.txType) {
      case TransactionFlowType.BRIDGE:
        const bridgeTxFlowData = getBridgeTransactionFlowData(flow.params);
        txFlowInfo.txFlowType = getBridgeMethodInfo(flow.params.method).name;
        txFlowInfo.txFlowData = bridgeTxFlowData;
        return  NO_ERROR(txFlowInfo)

      case TransactionFlowType.CANTO_DEX_LP_TX:
        const {data} =  await getCantoDexTransactionFlowData(flow.params)
        if(!data){
          return  NO_ERROR(undefined)
        }
        txFlowInfo.txFlowType = flow.params.txType;
        txFlowInfo.txFlowData = data;
        return  NO_ERROR(txFlowInfo)

      case TransactionFlowType.AMBIENT_LIQUIDITY_TX:
        const ambientLiquidityTxFlowData =  getAmbientLiquidityTransactionFlowData(flow.params)
        if(!ambientLiquidityTxFlowData){
          return  NO_ERROR(undefined)
        }
        txFlowInfo.txFlowType = flow.params.txType;
        txFlowInfo.txFlowData = ambientLiquidityTxFlowData;
        return  NO_ERROR(txFlowInfo)

      case TransactionFlowType.LP_COMBO_CLAIM_REWARDS_TX:
        const txFlowType = getLpComboClaimRewardsTransactionFlowType(flow.params)
        if(!txFlowType){
          return  NO_ERROR(undefined)
        }
        txFlowInfo.txFlowType = txFlowType;
        return  NO_ERROR(txFlowInfo)

      case TransactionFlowType.CLM_CTOKEN_TX:
        const clmCTokenTxFlowData =  getClmCTokenTransactionFlowData(flow.params)
        if(!clmCTokenTxFlowData){
          return  NO_ERROR(undefined)
        }
        txFlowInfo.txFlowType = flow.params.txType;
        txFlowInfo.txFlowData = clmCTokenTxFlowData;
        return  NO_ERROR(txFlowInfo)

      default:
        return  NO_ERROR(undefined)
    }
  } 


  export function getBridgeTransactionFlowData( bridgeTxParams : BridgeTransactionParams) : AnalyticsTransactionFlowData {
    const bridgeTxFlowData : AnalyticsTransactionFlowData = {
      bridgeFrom: getNetworkInfoFromChainId(bridgeTxParams.from.chainId).data.name,
      bridgeTo: getNetworkInfoFromChainId(bridgeTxParams.to.chainId).data.name,
      bridgeAsset:bridgeTxParams.token.data.symbol,
      bridgeAmount : displayAmount(bridgeTxParams.token.amount, bridgeTxParams.token.data.decimals, { short: false, precision: bridgeTxParams.token.data.decimals }),
    }
    return bridgeTxFlowData
  }  

export async function getCantoDexTransactionFlowData( cantoDexTxParams : CantoDexTransactionParams) : PromiseWithError< AnalyticsTransactionFlowData | undefined > {
  let txFlowData : AnalyticsTransactionFlowData
  switch (cantoDexTxParams.txType) {
    case CantoDexTxTypes.ADD_LIQUIDITY:
      txFlowData = {
        cantoLp: cantoDexTxParams.pair.symbol,
        cantoLpToken1: cantoDexTxParams.pair.token1.symbol,
        cantoLpAmount1: displayAmount(cantoDexTxParams.amounts.amount1, cantoDexTxParams.pair.token1.decimals, { short: false, precision: cantoDexTxParams.pair.token1.decimals}),
        cantoLpBalance1:  displayAmount(cantoDexTxParams.pair.token1.balance ?? "0", cantoDexTxParams.pair.token1.decimals, { short: false, precision: cantoDexTxParams.pair.token1.decimals}),
        cantoLpToken2: cantoDexTxParams.pair.token2.symbol,
        cantoLpAmount2:   displayAmount(cantoDexTxParams.amounts.amount2, cantoDexTxParams.pair.token2.decimals, { short: false, precision: cantoDexTxParams.pair.token2.decimals}),
        cantoLpBalance2: displayAmount(cantoDexTxParams.pair.token2.balance ?? "0", cantoDexTxParams.pair.token2.decimals, { short: false, precision: cantoDexTxParams.pair.token2.decimals}),
        cantoLpSlippage: cantoDexTxParams.slippage,
        cantoLpDeadline: cantoDexTxParams.deadline,
        cantoLpStakeStatus: cantoDexTxParams.stake,
      }
      return  NO_ERROR(txFlowData)

    case CantoDexTxTypes.REMOVE_LIQUIDITY:
      const lpTokenBlance = addTokenBalances(
        cantoDexTxParams.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
        cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
      )
      const {data} = await getQuote(cantoDexTxParams.amountLP ?? "0", cantoDexTxParams.pair)
      txFlowData = {
        cantoLp: cantoDexTxParams.pair.symbol,
        cantoLpTokenAmount: displayAmount(cantoDexTxParams.amountLP ?? "0", cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
        cantoLpTokenBalance: displayAmount(lpTokenBlance, cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
        cantoLpExpectedToken1:  displayAmount(data.expectedToken1 , cantoDexTxParams.pair.token1.decimals, { short: false, precision: cantoDexTxParams.pair.token1.decimals}),
        cantoLpExpectedToken2:  displayAmount(data.expectedToken2 , cantoDexTxParams.pair.token2.decimals, { short: false, precision: cantoDexTxParams.pair.token2.decimals}),
        cantoLpSlippage: cantoDexTxParams.slippage,
        cantoLpDeadline: cantoDexTxParams.deadline,
      }
      return  NO_ERROR(txFlowData)

    case CantoDexTxTypes.STAKE || CantoDexTxTypes.UNSTAKE:
      txFlowData = {
        cantoLp: cantoDexTxParams.pair.symbol,
        cantoLpTokenAmount:displayAmount(cantoDexTxParams.amountLP , cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
        cantoLpTokenBalance: displayAmount(cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0", cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
        cantoLpStakedBalance: displayAmount(cantoDexTxParams.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0", cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
        cantoLpUnstakedBalance:  displayAmount(cantoDexTxParams.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0", cantoDexTxParams.pair.decimals, { short: false, precision: cantoDexTxParams.pair.decimals}),
      }
      return  NO_ERROR(txFlowData)

    default:
      return  NO_ERROR(undefined)
    }
}

export function getAmbientLiquidityTransactionFlowData( ambientLiquidityTxParams : AmbientTransactionParams) : AnalyticsTransactionFlowData | undefined {
  let txFlowData : AnalyticsTransactionFlowData
  switch (ambientLiquidityTxParams.txType) {
    case AmbientTxType.ADD_CONC_LIQUIDITY:
      txFlowData = {
        ambientLp: ambientLiquidityTxParams.pool.symbol,
        ambientLpMinPrice:  displayAmount( ambientLiquidityTxParams.minExecPriceWei, 18, { short: false, precision: 18}),
        ambientLpMaxPrice:  displayAmount( ambientLiquidityTxParams.maxExecPriceWei, 18, { short: false, precision: 18}),
        ambientLpAmount: ambientLiquidityTxParams.amount,
        
      }
      return txFlowData
    case AmbientTxType.REMOVE_CONC_LIQUIDITY:
      txFlowData = {
        ambientLp: ambientLiquidityTxParams.pool.symbol,
        ambientLpMinPrice: displayAmount( ambientLiquidityTxParams.minExecPriceWei, 18, { short: false, precision: 18}),
        ambientLpMaxPrice: displayAmount( ambientLiquidityTxParams.maxExecPriceWei, 18, { short: false, precision: 18}),
        ambientLpLiquidity: ambientLiquidityTxParams.liquidity,
      }
      return txFlowData
    default:
      return undefined;
    }
}


export function getClmCTokenTransactionFlowData( clmCTokenTxParams : CTokenLendingTransactionParams) : AnalyticsTransactionFlowData | undefined {
  let txFlowData : AnalyticsTransactionFlowData
  switch (clmCTokenTxParams.txType) {
    case CTokenLendingTxTypes.SUPPLY || CTokenLendingTxTypes.WITHDRAW:
      txFlowData = {
        lmToken : clmCTokenTxParams.cToken.underlying.symbol,
        lmAmount: displayAmount(clmCTokenTxParams.amount,  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmCollateralStatus: clmCTokenTxParams.cToken.userDetails?.isCollateral,
        lmWalletBalance: displayAmount(clmCTokenTxParams.cToken.userDetails?.balanceOfUnderlying ?? "0",  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmSuppliedAmount:displayAmount(clmCTokenTxParams.cToken.userDetails?.supplyBalanceInUnderlying?? "0",  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmAccountLiquidityRemaining: displayAmount(clmCTokenTxParams.userPosition.liquidity,  18, { short: false, precision: 18}), 
      }
      return txFlowData

    case CTokenLendingTxTypes.BORROW || CTokenLendingTxTypes.REPAY:
      txFlowData = {
        lmToken : clmCTokenTxParams.cToken.underlying.symbol,
        lmAmount: displayAmount(clmCTokenTxParams.amount,  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmWalletBalance: displayAmount(clmCTokenTxParams.cToken.userDetails?.balanceOfUnderlying ?? "0",  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmBorrowedAmount:displayAmount(clmCTokenTxParams.cToken.userDetails?.borrowBalance?? "0",  clmCTokenTxParams.cToken.underlying.decimals, { short: false, precision: clmCTokenTxParams.cToken.underlying.decimals}), 
        lmAccountLiquidityRemaining: displayAmount(clmCTokenTxParams.userPosition.liquidity,  18, { short: false, precision: 18}), 
      }
      return txFlowData
   
    case CTokenLendingTxTypes.COLLATERALIZE || CTokenLendingTxTypes.DECOLLATERALIZE:
      txFlowData = {
        lmToken : clmCTokenTxParams.cToken.underlying.symbol 
      }
      return txFlowData
    default:
      return undefined;
    }
}

export function getLpComboClaimRewardsTransactionFlowType( lpComboClaimRewardsTxParams : ClaimDexComboRewardsParams) : string | undefined {
  if(lpComboClaimRewardsTxParams.clmParams && lpComboClaimRewardsTxParams.ambientParams){
    return "Claim Canto and Ambient Rewards"
  }
  else if(lpComboClaimRewardsTxParams.clmParams){
    return "Claim Canto Rewards"
  }
  else if(lpComboClaimRewardsTxParams.ambientParams){
    return "Claim Ambient Rewards"
  }
  else{
    return undefined
  }
}