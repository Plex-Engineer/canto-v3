import {
  NO_ERROR,
  ReturnWithError,
  NewTransactionFlow,
} from "@/config/interfaces";
import { CTokenLendingTransactionParams } from "../interfaces/lendingTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

export function createNewCTokenLendingFlow(
  params: CTokenLendingTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType + " " + params.cToken.underlying.symbol,
    icon: "",
    txType: TransactionFlowType.CLM_CTOKEN_TX,
    params: params,
  });
}
