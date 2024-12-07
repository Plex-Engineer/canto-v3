import { TransactionWithStatus } from "@/transactions/interfaces";
import {
  CantoFETxType
} from "@/transactions/interfaces";

/**
 * @notice Formats an error message to be more readable
 * @param {string} errorMsg Error message to format
 * @returns {string} Formatted error message
 */
export function formatError(errorMsg: string): string {
  // errors will look like "functionName::functionName: error message"
  const split = errorMsg.split(":");
  return "Error:" + split[split.length - 1];
}


export function parseError(tx: TransactionWithStatus): string {
  const error = tx.error ?? ""
  switch (tx.tx.feTxType) {
    case CantoFETxType.ADD_LIQUIDITY_CANTO_DEX:
    case CantoFETxType.REMOVE_LIQUIDITY_CANTO_DEX:
      if((/BaseV1Router: INSUFFICIENT_(A|B)_AMOUNT/).test(error)){
        return "Error: Insufficient slippage";
      }
      if((/BaseV1Router: EXPIRED/).test(error)){
        return "Error: Insufficient deadline";
      }
      break;
    case CantoFETxType.ADD_CONC_LIQUIDITY_AMBIENT:
    case CantoFETxType.REMOVE_CONC_LIQUIDITY_AMBIENT:
      if((/execution reverted: J/).test(error)){
        return "Error: Cannot remove liquidity, try after sometime";
      }
      if((/execution reverted: RC/).test(error)){
        return "Error: Price not in given execution range";
      }
      break;
    default:
      if((/not available/).test(error)){
        return "Error: Timeout";
      }
  }
  return formatError(error);
}
