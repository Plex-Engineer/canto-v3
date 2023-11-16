import { maxAmountForLendingTx } from "./limits.utils";
import { CTokenLendingTransactionParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import { Validation } from "@/config/interfaces";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { validateWeiUserInputTokenAmount } from "../math";

/**
 * @notice Checks if tx params are valid for lending tx
 * @param {CTokenLendingTransactionParams} txParams Transaction params to check
 * @param {UserLMPosition} position User position to check against
 * @returns {Validation} Validity and error reason
 */
export function lendingTxParamCheck(
  txParams: CTokenLendingTransactionParams,
  position: UserLMPosition
): Validation {
  // check amount
  const maxAmount = maxAmountForLendingTx(
    txParams.txType,
    txParams.cToken,
    position,
    100
  );
  return validateWeiUserInputTokenAmount(
    txParams.amount,
    "1",
    maxAmount,
    txParams.cToken.underlying.symbol,
    txParams.cToken.underlying.decimals
  );
}
