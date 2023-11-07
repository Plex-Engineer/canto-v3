import { maxAmountForLendingTx } from "./limits.utils";
import { CTokenLendingTransactionParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import { ValidationReturn } from "@/config/interfaces";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { validateInputTokenAmount } from "../math";

/**
 * @notice Checks if tx params are valid for lending tx
 * @param {CTokenLendingTransactionParams} txParams Transaction params to check
 * @param {UserLMPosition} position User position to check against
 * @returns {ValidationReturn} Validity and error reason
 */
export function lendingTxParamCheck(
  txParams: CTokenLendingTransactionParams,
  position: UserLMPosition
): ValidationReturn {
  // check amount
  const maxAmount = maxAmountForLendingTx(
    txParams.txType,
    txParams.cToken,
    position,
    100
  );
  return validateInputTokenAmount(
    txParams.amount,
    maxAmount,
    txParams.cToken.underlying.symbol,
    txParams.cToken.underlying.decimals
  );
}
