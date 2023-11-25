import { displayAmount } from "@/utils/formatting";
import { BridgeTransactionParams } from ".";
import { NewTransactionFlow, TransactionFlowType } from "../flows";

export const newCantoBridgeFlow = (
  txParams: BridgeTransactionParams
): NewTransactionFlow => ({
  title: `Bridge ${displayAmount(
    txParams.token.amount,
    txParams.token.data.decimals,
    { symbol: txParams.token.data.symbol }
  )}`,
  icon: txParams.token.data.icon,
  txType: TransactionFlowType.BRIDGE,
  params: txParams,
});
