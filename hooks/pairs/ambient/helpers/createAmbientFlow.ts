import {
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { AmbientTransactionParams } from "../interfaces/ambientTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

export function createNewAmbientTxFlow(
  params: AmbientTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: `${params.txType} ${params.pair.symbol}`,
    icon: params.pair.logoURI,
    txType: TransactionFlowType.AMBIENT_LIQUIDITY_TX,
    params: params,
  });
}
