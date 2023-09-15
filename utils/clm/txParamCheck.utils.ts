import { convertToBigNumber } from "../tokenBalances.utils";
import { maxAmountForLendingTx } from "./limits.utils";
import { CTokenLendingTransactionParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";

/**
 * @notice Checks if tx params are valid for lending tx
 * @param {CTokenLendingTransactionParams} txParams Transaction params to check
 * @param {UserLMPosition} position User position to check against
 * @returns {ReturnWithError<boolean>} True if tx params are valid
 */
export function lendingTxParamCheck(
  txParams: CTokenLendingTransactionParams,
  position: UserLMPosition
): ReturnWithError<boolean> {
  // check amount
  const maxAmount = maxAmountForLendingTx(
    txParams.txType,
    txParams.cToken,
    position,
    100
  );
  const { data: bnAmount, error: bnAmountError } = convertToBigNumber(
    txParams.amount
  );
  if (bnAmountError) return NEW_ERROR("cTokenLendingTx: invalid amount");
  return NO_ERROR(bnAmount.lte(maxAmount) && bnAmount.gt(0));
}
