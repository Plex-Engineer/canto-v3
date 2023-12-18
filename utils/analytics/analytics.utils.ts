import {NewTransactionFlow} from "@/transactions/flows";
import { TransactionFlowType } from "@/transactions/flows";
import  {BridgeTransactionParams, getBridgingMethodName} from "@/transactions/bridge/types";
import {AnalyticsTransactionFlowInfo, AnalyticsTransactionFlowData} from "@/provider/analytics";
import { getNetworkInfoFromChainId } from "@/utils/networks";
import BigNumber from "bignumber.js";
import  {v4 as uuidv4} from "uuid"

export function getAnalyticsTransactionFlowInfo(flow : NewTransactionFlow) : AnalyticsTransactionFlowInfo | undefined{
    const txFlowCategory  = flow.txType
    switch (txFlowCategory) {
      case TransactionFlowType.BRIDGE:
        const bridgeTxParams:  BridgeTransactionParams = flow.params as BridgeTransactionParams
        const txFlowData : AnalyticsTransactionFlowData = {
          bridgeFrom: getNetworkInfoFromChainId(bridgeTxParams.from.chainId).data.name,
          bridgeTo: getNetworkInfoFromChainId(bridgeTxParams.to.chainId).data.name,
          bridgeAsset:bridgeTxParams.token.data.symbol,
          bridgeAmount : new BigNumber(bridgeTxParams.token.amount).dividedBy(new BigNumber(10).pow(bridgeTxParams.token.data.decimals)).toString(),
        }
        const txFlowInfo : AnalyticsTransactionFlowInfo = {
          txFlowId: uuidv4(),
          txFlowCategory: txFlowCategory,
          txFlowType: getBridgingMethodName(bridgeTxParams.method),
          txFlowData,
          txCount:0,
          txList:[],
        }
        return txFlowInfo
      default:
        return undefined 
    }
  } 