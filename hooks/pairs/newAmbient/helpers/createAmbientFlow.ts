import {
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { AmbientTransactionParams } from "../interfaces/ambientPoolTxTypes";

export function createNewAmbientTxFlow(
  params: AmbientTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: `${params.txType} ${params.pool.symbol}`,
    icon: params.pool.logoURI,
    txType: TransactionFlowType.AMBIENT_LIQUIDITY_TX,
    params: params,
  });
}
