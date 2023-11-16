import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { convertNoteAmountToToken, minOf } from "../math";
import { convertToBigNumber } from "../formatting";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { CTokenLendingTxTypes } from "@/transactions/lending/types";

/**
 * @notice Calculates the maximum amount of tokens that can be borrowed
 * @param {CTokenWithUserData} cToken CToken to borrow from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to borrow (optional parameter)
 * @returns {ReturnWithError<string>} Maximum amount of tokens that can be borrowed to reach percent
 */
export function cTokenBorrowLimit(
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  percent: number = 100
): ReturnWithError<string> {
  // just convert liquidity to token amount
  const { data: maxTokenBorrow, error: maxTokenBorrowError } =
    convertNoteAmountToToken(currentLiquidity, cToken.price);
  if (maxTokenBorrowError) {
    return NEW_ERROR("cTokenBorrowLimit", maxTokenBorrowError);
  }
  return NO_ERROR(maxTokenBorrow.times(percent).div(100).toString());
}

/**
 * @notice Calculates the maximum amount of tokens that can be withdrawn
 * @dev If the token is not collateral, then the user can withdraw all of their tokens
 * @param {CTokenWithUserData} cToken CToken to withdraw from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to withdraw (optional parameter)
 * @returns {ReturnWithError<string>} Maximum amount of tokens that can be withdrawn to reach percent
 */
export function cTokenWithdrawLimit(
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  totalBorrows: string,
  percent: number = 100
): ReturnWithError<string> {
  try {
    // make sure we have user data
    if (!cToken.userDetails) throw Error("no user details");
    // first check if token is collateral or no borrows are present (if not, then no limit)
    if (
      cToken.userDetails?.isCollateral === false ||
      Number(cToken.collateralFactor) === 0 ||
      Number(totalBorrows) === 0
    ) {
      return NO_ERROR(cToken.userDetails.supplyBalanceInUnderlying);
    }
    // liquidity change = (tokenAmount * price) * CF
    // if this is greater than the current liquidity, then the user cannot withdraw
    // maxWithdraw = (currentLiquidity * (percent/100)) / (CF * price) == amountInToken / CF
    const { data: bnLiquidity, error: bnLiquidityError } =
      convertToBigNumber(currentLiquidity);
    if (bnLiquidityError) throw bnLiquidityError;

    const liquidityToUse = bnLiquidity.times(percent).div(100);

    const { data: liquidityInToken, error: liquidityInTokenError } =
      convertNoteAmountToToken(liquidityToUse.toString(), cToken.price);
    if (liquidityInTokenError) throw liquidityInTokenError;

    // get total limit
    const totalLimit = liquidityInToken
      .times(10 ** 18)
      .div(cToken.collateralFactor);
    // minumum between supplyBalance and totalLimit
    const { data: userLimit, error: minError } = minOf(
      totalLimit.toString(),
      cToken.userDetails.supplyBalanceInUnderlying
    );
    if (minError) throw minError;
    // CF is scaled to 10 ^ 18
    return NO_ERROR(userLimit);
  } catch (err) {
    return NEW_ERROR("cTokenWithdrawLimit", err);
  }
}

/**
 * @notice Calculates the maximum amount of tokens that can be used for a tx
 * @param {CTokenLendingTxTypes} txType Type of tx to calculate for
 * @param {CTokenWithUserData} cToken CToken to transact to
 * @param {UserLMPosition} position User position to use for calculations
 * @param {number} percent Percent of the maximum amount to use (optional parameter)
 * @returns {string} Maximum amount of tokens that can be used for tx
 */
export function maxAmountForLendingTx(
  txType: CTokenLendingTxTypes,
  cToken: CTokenWithUserData,
  position: UserLMPosition | undefined,
  percent: number = 100
): string {
  if (!cToken.userDetails) return "0";
  switch (txType) {
    case CTokenLendingTxTypes.SUPPLY:
      return cToken.userDetails.balanceOfUnderlying ?? "0";
    case CTokenLendingTxTypes.WITHDRAW:
      // check if position is defined
      if (!position) return "0";
      const maxAmount = cTokenWithdrawLimit(
        cToken,
        position.liquidity,
        position.totalBorrow,
        percent
      );
      if (maxAmount.error) return "0";
      return maxAmount.data;
    case CTokenLendingTxTypes.BORROW:
      // check if position is defined
      if (!position) return "0";
      const maxBorrow = cTokenBorrowLimit(cToken, position.liquidity, percent);
      if (maxBorrow.error) return "0";
      return maxBorrow.data;
    case CTokenLendingTxTypes.REPAY:
      const minRepay = minOf(
        cToken.userDetails.borrowBalance,
        cToken.userDetails.balanceOfUnderlying
      );
      if (minRepay.error) return "0";
      return minRepay.data;
    default:
      return "0";
  }
}
