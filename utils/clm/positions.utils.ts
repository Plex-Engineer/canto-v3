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

/**
 * @notice Checks if amount is good enough to supply for token
 * @dev Amount must be greater than 0 and less than or equal to balanceOfUnderlying
 * @param {string} amount Amount to supply
 * @param {string} balanceOfUnderlying Balance of underlying token
 * @returns {boolean} True if amount is good enough to supply
 */
export function canSupply(
  amount: string,
  balanceOfUnderlying: string
): boolean {
  const { data: bnAmount, error: bnAmountError } = convertToBigNumber(amount);
  if (bnAmountError) return false;
  return bnAmount.lte(balanceOfUnderlying) && bnAmount.gt(0);
}

/**
 * @notice Checks if amount is good enough to repay for token
 * @dev Amount must be greater than 0, less than or equal to balanceOfUnderlying, and less than or equal to borrowBalance
 * @param {string} amount Amount to repay
 * @param {string} balanceOfUnderlying Balance of underlying token
 * @param {string} borrowBalance Borrow balance of token
 * @returns {boolean} True if amount is good enough to repay
 */
export function canRepay(
  amount: string,
  balanceOfUnderlying: string,
  borrowBalance: string
): boolean {
  const { data: bnAmount, error: bnAmountError } = convertToBigNumber(amount);
  if (bnAmountError) return false;
  return (
    bnAmount.lte(balanceOfUnderlying) &&
    bnAmount.lte(borrowBalance) &&
    bnAmount.gt(0)
  );
}

/**
 * @notice Checks if amount is good enough to borrow for token
 * @dev Amount must be greater than 0 and less than or equal to borrowLimit
 * @param {string} amount Amount to borrow
 * @param {CTokenWithUserData} cToken CToken to borrow from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to borrow (optional parameter)
 * @returns {boolean} True if amount is good enough to borrow
 */
export function canBorrow(
  amount: string,
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  percent: number = 100
): boolean {
  const { data: borrowLimit, error: borrowLimitError } = cTokenBorrowLimit(
    cToken,
    currentLiquidity,
    percent
  );
  if (borrowLimitError) return false;
  return borrowLimit.gte(amount) && Number(amount) > 0;
}

/**
 * @notice Checks if amount is good enough to withdraw for token
 * @dev Amount must be greater than 0, less than or equal to supplyBalanceInUnderlying, and less than or equal to withdrawLimit
 * @param {string} amount Amount to withdraw
 * @param {CTokenWithUserData} cToken CToken to withdraw from
 * @param {string} currentLiquidity Current liquidity of the user
 * @param {number} percent Percent of the maximum amount to withdraw (optional parameter)
 * @returns {boolean} True if amount is good enough to withdraw
 */
export function canWithdraw(
  amount: string,
  cToken: CTokenWithUserData,
  currentLiquidity: string,
  percent: number = 100
): boolean {
  if (!cToken.userDetails) return false;
  const { data: withdrawLimit, error: withdrawLimitError } =
    cTokenWithdrawLimit(cToken, currentLiquidity, percent);
  if (withdrawLimitError) return false;
  const { data: bnAmount, error: bnAmountError } = convertToBigNumber(amount);
  if (bnAmountError) return false;
  return (
    withdrawLimit.gte(amount) &&
    bnAmount.lte(cToken.userDetails.supplyBalanceInUnderlying) &&
    bnAmount.gt(0)
  );
}
