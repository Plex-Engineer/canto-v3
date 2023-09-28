import {
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { PairsTransactionParams } from "../interfaces/pairsTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

/**
 * @notice Creates a new transaction flow for pairs
 * @param {PairsTransactionParams} params - The parameters to create a new transaction flow
 * @returns {ReturnWithError<NewTransactionFlow>} New transaction flow
 */
export function createNewPairsTxFlow(
  params: PairsTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType + " " + params.pair.symbol,
    icon: params.pair.logoURI,
    txType: TransactionFlowType.DEX_LP_TX,
    params: params,
  });
}
