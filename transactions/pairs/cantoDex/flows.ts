import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { CantoDexTransactionParams } from ".";

/**
 * @notice Creates a new transaction flow for pairs
 * @param {CantoDexTransactionParams} txParams - The parameters to create a new transaction flow
 * @returns {NewTransactionFlow} New transaction flow
 */
export const newCantoDexLPFlow = (
  txParams: CantoDexTransactionParams
): NewTransactionFlow => ({
  title: txParams.txType + " " + txParams.pair.symbol,
  icon: txParams.pair.logoURI,
  txType: TransactionFlowType.CANTO_DEX_LP_TX,
  params: txParams,
});
