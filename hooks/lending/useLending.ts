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
import { convertToBigNumber } from "@/utils/formatBalances";
import { LendingHookInputParams } from "./interfaces/hookParams";
import { getGeneralCTokenData, getUserCLMLensData } from "./helpers/clmLens";
import { getTotalBorrowAndSupplyFromCTokens } from "./helpers/cTokens";
import { UserLMPosition } from "./interfaces/userPositions";
import { useState } from "react";

/**
 * @name useLending
 * @description Hook for Canto Lending Market Tokens and User Data
 * @returns
 */
export default function useLending(params: LendingHookInputParams) {
  // internal state for tokens and position (ONLY SET ON SUCCESS)
  // stops failed queries from overwriting the data with empty arrays
  const [tokens, setTokens] = useState<CTokenWithUserData[]>([]);
  const [position, setPosition] = useState<UserLMPosition>({
    liquidity: "0",
    shortfall: "0",
    totalSupply: "0",
    totalBorrow: "0",
  });
  // use query to get all general and user cToken data
  const { isLoading: loadingCTokens, error: errorCTokens } = useQuery(
    ["lending", params.testnet, params.userEthAddress],
    async (): Promise<{
      cTokens: CTokenWithUserData[];
      position?: UserLMPosition;
    }> => {
      const [generalCTokens, userCTokens] = await Promise.all([
        getGeneralCTokenData(params.testnet),
        getUserCLMLensData(params.userEthAddress ?? "", params.testnet),
      ]);
      // check errors and return what is available
      // if general error, then throw error now
      if (generalCTokens.error) {
        throw generalCTokens.error;
      }
      // if user error, then just return the general data
      if (userCTokens.error) {
        return {
          cTokens: generalCTokens.data,
        };
      }
      // since both are okay, combine the data
      const combinedCTokenData = generalCTokens.data.map((cToken) => {
        const userCTokenDetails = userCTokens.data.balances.find((balance) => {
          return (
            balance.cTokenAddress.toLowerCase() === cToken.address.toLowerCase()
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

      // do some get total user positions
      const { data: positionTotals, error: positionError } =
        getTotalBorrowAndSupplyFromCTokens(combinedCTokenData);
      if (positionError) {
        return {
          cTokens: combinedCTokenData,
        };
      }
      const userTotalPosition = {
        liquidity: userCTokens.data.limits.liquidity.toString(),
        shortfall: userCTokens.data.limits.shortfall.toString(),
        totalSupply: positionTotals.totalSupply,
        totalBorrow: positionTotals.totalBorrow,
      };

      return { cTokens: combinedCTokenData, position: userTotalPosition };
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess: (data) => {
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
    params: CTokenLendingTransactionParams
  ): ReturnWithError<boolean> {
    // check to make sure user details are available
    if (!params.cToken.userDetails) {
      return NEW_ERROR(
        "canPerformLendingTx: cToken does not have user details"
      );
    }
    // check to make sure amount is okay
    switch (params.type) {
      case CTokenLendingTxTypes.SUPPLY:
      // check user has enough balance
      case CTokenLendingTxTypes.REPAY: {
        // check user has enough balance and borrow balance to pay back
        const { data: userAmount, error: userAmountError } = convertToBigNumber(
          params.amount
        );
        if (userAmountError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(userAmountError));
        }
        const { data: userBalance, error: userBalanceError } =
          convertToBigNumber(params.cToken.userDetails.balanceOfUnderlying);
        if (userBalanceError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(userBalanceError));
        }
        if (userAmount.gt(userBalance)) {
          return NEW_ERROR(
            "canPerformLendingTx: user does not have enough balance"
          );
        }
      }
      case CTokenLendingTxTypes.BORROW:
      // check borrow limit
      case CTokenLendingTxTypes.WITHDRAW:
      // check borrow limit
      case CTokenLendingTxTypes.DECOLLATERALIZE:
      // check borrow limit
      case CTokenLendingTxTypes.COLLATERALIZE:
        // no checks needed
        return NO_ERROR(true);
      default:
        return NEW_ERROR("canPerformLendingTx: invalid type: " + params.type);
    }
  }

  return {
    tokens,
    position,
    loading: loadingCTokens,
    error: errorCTokens,
  };
}
