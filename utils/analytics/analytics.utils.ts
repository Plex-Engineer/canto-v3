import {NewTransactionFlow} from "@/transactions/flows";
import { TransactionFlowType } from "@/transactions/flows";
import  {getBridgeMethodInfo} from "@/transactions/bridge/types";
import {AnalyticsTransactionFlowInfo, AnalyticsTransactionFlowData} from "@/provider/analytics";
import { getNetworkInfoFromChainId } from "@/utils/networks";
import { displayAmount } from "../formatting";

export function getAnalyticsTransactionFlowInfo(flow : NewTransactionFlow, flowId: string) : AnalyticsTransactionFlowInfo | undefined{
    switch (flow.txType) {
      case TransactionFlowType.BRIDGE:
        const bridgeTxParams = flow.params;
        const txFlowData : AnalyticsTransactionFlowData = {
          bridgeFrom: getNetworkInfoFromChainId(bridgeTxParams.from.chainId).data.name,
          bridgeTo: getNetworkInfoFromChainId(bridgeTxParams.to.chainId).data.name,
          bridgeAsset:bridgeTxParams.token.data.symbol,
          bridgeAmount : displayAmount(bridgeTxParams.token.amount, bridgeTxParams.token.data.decimals, { short: false, precision: bridgeTxParams.token.data.decimals }),
        }
        const txFlowInfo : AnalyticsTransactionFlowInfo = {
          txFlowId: flowId,
          txFlowCategory: flow.txType,
          txFlowType: getBridgeMethodInfo(bridgeTxParams.method).name,
          txFlowData,
          txCount:0,
          txList:[],
        }
        return txFlowInfo
      default:
        return undefined 
    }
  } 