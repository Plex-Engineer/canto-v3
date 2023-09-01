import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { CTokenWithUserData } from "../interfaces/tokens";
import BigNumber from "bignumber.js";
import { convertTokenAmountToNote } from "@/utils/tokens/tokenMath.utils";

export function getLMTotalsFromCTokens(
  userCTokens: CTokenWithUserData[],
  compAccrued: string = "0"
): ReturnWithError<{
  totalSupply: string;
  totalBorrow: string;
  totalRewards: string;
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
          cToken.userDetails.suppyBalanceInUnderlying,
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

      // add to totals
      return {
        totalSupply: acc.totalSupply.plus(supplyInNote),
        totalBorrow: acc.totalBorrow.plus(borrowInNote),
        totalRewards: acc.totalRewards.plus(cToken.userDetails.rewards),
      };
    },
    {
      totalSupply: new BigNumber(0),
      totalBorrow: new BigNumber(0),
      totalRewards: new BigNumber(compAccrued),
    }
  );
  return errorInLoop
    ? NEW_ERROR("getLMTotalsFromCTokens: " + errorReaons.join(", "))
    : NO_ERROR({
        totalSupply: totals.totalSupply.toString(),
        totalBorrow: totals.totalBorrow.toString(),
        totalRewards: totals.totalRewards.toString(),
      });
}
