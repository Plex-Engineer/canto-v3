import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { CTokenWithUserData } from "../interfaces/tokens";
import BigNumber from "bignumber.js";
import { convertTokenAmountToNote } from "@/utils/tokens/tokenMath.utils";

/**
 * @notice Gets total supply, borrow, and rewards from user cTokens
 * @dev total supply and borrow are in $NOTE, total rewards are in WCANTO
 * @param {CTokenWithUserData[]} userCTokens cTokens with user balances
 * @param {string} compAccrued in $WCANTO, how mich had already been accrued
 * @returns {ReturnWithError<{totalSupply: string, totalBorrow: string, totalRewards: string, avgApr: string}>} Totals
 */
export function getLMTotalsFromCTokens(
  userCTokens: CTokenWithUserData[],
  compAccrued: string = "0"
): ReturnWithError<{
  totalSupply: string;
  totalBorrow: string;
  totalRewards: string;
  avgApr: string;
}> {
  let errorInLoop = false;
  let errorReaons: string[] = [];

  // calculate total supply and borrow
  const totals = userCTokens.reduce(
    (acc, cToken, idx) => {
      // typeguard user details
      if (!cToken.userDetails) {
        errorInLoop = true;
        errorReaons.push(idx + ": no user details");
        return acc;
      }
      // get the values in $note
      const { data: supplyInNote, error: supplyError } =
        convertTokenAmountToNote(
          cToken.userDetails.supplyBalanceInUnderlying,
          cToken.price
        );
      const { data: borrowInNote, error: borrowError } =
        convertTokenAmountToNote(
          cToken.userDetails.borrowBalance,
          cToken.price
        );
      if (supplyError || borrowError) {
        errorReaons.push(
          idx + ": " + (supplyError?.message ?? borrowError?.message ?? "")
        );
        errorInLoop = true;
        return acc;
      }
      // get the apr in $note
      const supplyAprInNote = new BigNumber(
        Number(cToken.supplyApy) + Number(cToken.distApy)
      ).multipliedBy(supplyInNote);
      const borrowAprInNote = new BigNumber(cToken.borrowApy).multipliedBy(
        borrowInNote
      );
      // add to totals
      return {
        totalSupply: acc.totalSupply.plus(supplyInNote),
        totalBorrow: acc.totalBorrow.plus(borrowInNote),
        totalRewards: acc.totalRewards.plus(cToken.userDetails.rewards),
        cummulativeApr: acc.cummulativeApr
          .plus(supplyAprInNote)
          .minus(borrowAprInNote),
      };
    },
    {
      totalSupply: new BigNumber(0),
      totalBorrow: new BigNumber(0),
      totalRewards: new BigNumber(compAccrued),
      cummulativeApr: new BigNumber(0),
    }
  );
  // to get average apr, we want sum(supplyApr * supplyBalance - borrowApr * borrowBalance) / (supplyBalance + borrowBalance)
  // cummulative apr = supplyApr * supply - borrowApr * borrow (All in $NOTE)
  let avgApr = new BigNumber(0);
  // check if division by zero will happen
  if (totals.totalSupply.plus(totals.totalBorrow).isGreaterThan(0)) {
    avgApr = totals.cummulativeApr.div(
      totals.totalSupply.plus(totals.totalBorrow)
    );
  }
  return errorInLoop
    ? NEW_ERROR("getLMTotalsFromCTokens: " + errorReaons.join(", "))
    : NO_ERROR({
        totalSupply: totals.totalSupply.toString(),
        totalBorrow: totals.totalBorrow.toString(),
        totalRewards: totals.totalRewards.toString(),
        avgApr: avgApr.toString(),
      });
}
