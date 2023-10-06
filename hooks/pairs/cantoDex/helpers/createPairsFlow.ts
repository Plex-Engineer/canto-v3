import {
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { CantoDexTransactionParams } from "../interfaces/pairsTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

/**
 * @notice Creates a new transaction flow for pairs
 * @param {CantoDexTransactionParams} params - The parameters to create a new transaction flow
 * @returns {ReturnWithError<NewTransactionFlow>} New transaction flow
 */
export function createNewCantoDexTxFLow(
  params: CantoDexTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType + " " + params.pair.symbol,
    icon: params.pair.logoURI,
    txType: TransactionFlowType.CANTO_DEX_LP_TX,
    params: params,
  });
}
