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
  // CF is scaled to 10 ^ 18
  return NO_ERROR(
    liquidityInToken.times(10 ** 18).div(cToken.collateralFactor)
  );
}
