import { useQuery } from "react-query";
import { CTokenWithUserData } from "./interfaces/tokens";
import {
  CTokenLendingTransactionParams,
  CTokenLendingTxTypes,
} from "./interfaces/lendingTxTypes";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";
import {
  LendingHookInputParams,
  LendingHookReturn,
} from "./interfaces/hookParams";
import { getGeneralCTokenData, getUserCLMLensData } from "./helpers/clmLens";
import { UserLMPosition } from "./interfaces/userPositions";
import { useState } from "react";
import { getLMTotalsFromCTokens } from "./helpers/cTokens";
import {
  cTokenBorrowLimit,
  cTokenWithdrawLimit,
} from "@/utils/clm/positions.utils";

/**
 * @name useLending
 * @description Hook for Canto Lending Market Tokens and User Data
 * @returns
 */
export default function useLending(
  params: LendingHookInputParams
): LendingHookReturn {
  // internal state for tokens and position (ONLY SET ON SUCCESS)
  // stops failed queries from overwriting the data with empty arrays
  const [tokens, setTokens] = useState<CTokenWithUserData[]>([]);
  const [position, setPosition] = useState<UserLMPosition>({
    liquidity: "0",
    shortfall: "0",
    totalSupply: "0",
    totalBorrow: "0",
    totalRewards: "0",
  });
  // use query to get all general and user cToken data
  const { isLoading: loadingCTokens, error: errorCTokens } = useQuery(
    ["lending", params.testnet, params.userEthAddress],
    async (): Promise<{
      cTokens: CTokenWithUserData[];
      position?: UserLMPosition;
    }> => {
      const [generalCTokens, userLMData] = await Promise.all([
        getGeneralCTokenData(params.testnet),
        getUserCLMLensData(params.userEthAddress ?? "", params.testnet),
      ]);
      // check errors and return what is available
      // if general error, then throw error now
      if (generalCTokens.error) {
        throw generalCTokens.error;
      }
      // if user error, then just return the general data
      if (userLMData.error) {
        return { cTokens: generalCTokens.data };
      }
      // since both are okay, combine the data
      const combinedCTokenData = generalCTokens.data.map((cToken) => {
        const userCTokenDetails = userLMData.data.cTokens.find((userCToken) => {
          return (
            userCToken.cTokenAddress.toLowerCase() ===
            cToken.address.toLowerCase()
          );
        });
        if (userCTokenDetails) {
          return {
            ...cToken,
            userDetails: userCTokenDetails,
          };
        }
        return cToken;
      });
      // get total user positions
      const { data: positionTotals, error: positionError } =
        getLMTotalsFromCTokens(
          combinedCTokenData,
          userLMData.data.compAccrued.toString()
        );
      if (positionError) {
        return {
          cTokens: combinedCTokenData,
        };
      }
      const userTotalPosition = {
        liquidity: userLMData.data.limits.liquidity.toString(),
        shortfall: userLMData.data.limits.shortfall.toString(),
        totalSupply: positionTotals.totalSupply,
        totalBorrow: positionTotals.totalBorrow,
        totalRewards: positionTotals.totalRewards,
      };

      return { cTokens: combinedCTokenData, position: userTotalPosition };
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess(data) {
        setTokens(data.cTokens);
        data.position && setPosition(data.position);
      },
      refetchInterval: 5000,
    }
  );

  ///
  /// external functions
  ///
  function canPerformLendingTx(
    txParams: CTokenLendingTransactionParams
  ): ReturnWithError<boolean> {
    // make sure all the info we have is from the eth account
    if (
      txParams.ethAccount.toLowerCase() !== params.userEthAddress?.toLowerCase()
    ) {
      return NEW_ERROR(
        "canPerformLendingTx: txParams.ethAccount does not match params.userEthAddress"
      );
    }
    // check to make sure user details are available
    if (!txParams.cToken.userDetails) {
      return NEW_ERROR(
        "canPerformLendingTx: cToken does not have user details"
      );
    }
    // check to make sure amount is okay
    const { data: userAmount, error: userAmountError } = convertToBigNumber(
      txParams.amount
    );
    if (userAmountError) {
      return NEW_ERROR("canPerformLendingTx::" + errMsg(userAmountError));
    }
    switch (txParams.type) {
      case CTokenLendingTxTypes.SUPPLY:
      // check user has enough balance
      case CTokenLendingTxTypes.REPAY: {
        // check user has enough balance and borrow balance to pay back
        const { data: userBalance, error: userBalanceError } =
          convertToBigNumber(txParams.cToken.userDetails.balanceOfUnderlying);
        if (userBalanceError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(userBalanceError));
        }
        if (txParams.type === CTokenLendingTxTypes.REPAY) {
          return NO_ERROR(
            userAmount.lte(userBalance) &&
              userAmount.gt(0) &&
              userAmount.lte(txParams.cToken.userDetails.borrowBalance)
          );
        }
        return NO_ERROR(userAmount.lte(userBalance) && userAmount.gt(0));
      }
      case CTokenLendingTxTypes.BORROW:
        // check borrow limit
        const { data: borrowLimit, error: borrowLimitError } =
          cTokenBorrowLimit(txParams.cToken, position.liquidity);
        if (borrowLimitError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(borrowLimitError));
        }
        return NO_ERROR(borrowLimit.gte(userAmount) && userAmount.gt(0));
      case CTokenLendingTxTypes.WITHDRAW:
      // check withdraw limit with amount and current supply
      case CTokenLendingTxTypes.DECOLLATERALIZE:
        // check withdraw limit with total supply
        const { data: withdrawLimit, error: withdrawLimitError } =
          cTokenWithdrawLimit(txParams.cToken, position.liquidity);
        if (withdrawLimitError) {
          return NEW_ERROR(
            "canPerformLendingTx::" + errMsg(withdrawLimitError)
          );
        }
        if (txParams.type === CTokenLendingTxTypes.WITHDRAW) {
          return NO_ERROR(
            withdrawLimit.gte(userAmount) &&
              userAmount.gt(0) &&
              userAmount.lte(
                txParams.cToken.userDetails.supplyBalanceInUnderlying
              )
          );
        } else {
          // must be decollateralizing (same as withdrawing all supply)
          return NO_ERROR(
            withdrawLimit.gte(
              txParams.cToken.userDetails.supplyBalanceInUnderlying
            )
          );
        }
      case CTokenLendingTxTypes.COLLATERALIZE:
        // no checks needed
        return NO_ERROR(true);
      default:
        return NEW_ERROR("canPerformLendingTx: invalid type: " + txParams.type);
    }
  }

  return {
    tokens,
    position,
    loading: loadingCTokens,
    error: errorCTokens,
    canPerformLendingTx,
  };
}
