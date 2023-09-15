import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import BigNumber from "bignumber.js";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { convertNoteAmountToToken } from "../tokens/tokenMath.utils";
import { convertToBigNumber } from "../tokenBalances.utils";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";

/**
 * @notice Calculates the maximum amount of tokens that can be borrowed
 * @param {CTokenWithUserData} cToken CToken to borrow from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to borrow (optional parameter)
 * @returns {ReturnWithError<BigNumber>} Maximum amount of tokens that can be borrowed to reach percent
 */
export function cTokenBorrowLimit(
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  percent: number = 100
): ReturnWithError<BigNumber> {
  // just convert liquidity to token amount
  const { data: maxTokenBorrow, error: maxTokenBorrowError } =
    convertNoteAmountToToken(currentLiquidity, cToken.price);
  if (maxTokenBorrowError) {
    return NEW_ERROR(`cTokenBorrowLimit: ${errMsg(maxTokenBorrowError)}`);
  }
  return NO_ERROR(maxTokenBorrow.times(percent).div(100));
}

/**
 * @notice Calculates the maximum amount of tokens that can be withdrawn
 * @dev If the token is not collateral, then the user can withdraw all of their tokens
 * @param {CTokenWithUserData} cToken CToken to withdraw from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to withdraw (optional parameter)
 * @returns {ReturnWithError<BigNumber>} Maximum amount of tokens that can be withdrawn to reach percent
 */
export function cTokenWithdrawLimit(
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  percent: number = 100
): ReturnWithError<BigNumber> {
  // make sure we have user data
  if (!cToken.userDetails) {
    return NEW_ERROR("cTokenWithdrawLimit: no user details");
  }
  // first check if token is collateral (if not, then no limit)
  if (
    cToken.userDetails?.isCollateral === false ||
    Number(cToken.collateralFactor) === 0
  ) {
    return NO_ERROR(
      convertToBigNumber(cToken.userDetails.supplyBalanceInUnderlying).data
    );
  }
  // liquidity change = (tokenAmount * price) * CF
  // if this is greater than the current liquidity, then the user cannot withdraw
  // maxWithdraw = (currentLiquidity * (percent/100)) / (CF * price) == amountInToken / CF
  const { data: bnLiquidity, error: bnLiquidityError } =
    convertToBigNumber(currentLiquidity);
  if (bnLiquidityError) {
    return NEW_ERROR(`cTokenWithdrawLimit: ${errMsg(bnLiquidityError)}`);
  }
  const liquidityToUse = bnLiquidity.times(percent).div(100);

  const { data: liquidityInToken, error: liquidityInTokenError } =
    convertNoteAmountToToken(liquidityToUse.toString(), cToken.price);
  if (liquidityInTokenError) {
    return NEW_ERROR(`cTokenWithdrawLimit: ${errMsg(liquidityInTokenError)}`);
  }
  // get total limit
  const totalLimit = liquidityInToken
    .times(10 ** 18)
    .div(cToken.collateralFactor);
  // minumum between supplyBalance and totalLimit
  const userLimit = BigNumber.min(
    totalLimit,
    cToken.userDetails.supplyBalanceInUnderlying
  );
  // CF is scaled to 10 ^ 18
  return NO_ERROR(userLimit);
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
  position: UserLMPosition,
  percent: number = 100
): string {
  if (!cToken.userDetails) return "0";
  switch (txType) {
    case CTokenLendingTxTypes.SUPPLY:
      return cToken.userDetails.balanceOfUnderlying ?? "0";
    case CTokenLendingTxTypes.WITHDRAW:
      const maxAmount = cTokenWithdrawLimit(
        cToken,
        position.liquidity,
        percent
      );
      if (maxAmount.error) return "0";
      return maxAmount.data.toString();
    case CTokenLendingTxTypes.BORROW:
      const maxBorrow = cTokenBorrowLimit(cToken, position.liquidity, percent);
      if (maxBorrow.error) return "0";
      return maxBorrow.data.toString();
    case CTokenLendingTxTypes.REPAY:
      return Math.min(
        Number(cToken.userDetails.borrowBalance),
        Number(cToken.userDetails.balanceOfUnderlying)
      ).toString();
    default:
      return "0";
  }
}
