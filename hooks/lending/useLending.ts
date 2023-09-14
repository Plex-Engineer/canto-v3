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
import { UserLMPosition } from "./interfaces/userPositions";
import { useState } from "react";
import {
  cTokenBorrowLimit,
  cTokenWithdrawLimit,
} from "@/utils/clm/positions.utils";
import { getAllUserCLMData } from "./helpers/userClmData";

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
    avgApr: "0",
  });
  // use query to get all general and user cToken data
  const { isLoading: loadingCTokens, error: errorCTokens } = useQuery(
    ["lending", params.chainId, params.userEthAddress],
    async () => {
      return await getAllUserCLMData(
        params.userEthAddress ?? "",
        params.chainId
      );
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess(response) {
        if (response.error) {
          console.log(response.error);
          return;
        }
        setTokens(response.data.cTokens);
        response.data.position && setPosition(response.data.position);
      },
      refetchInterval: 10000,
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
    // make sure amount is greater than zero as well
    if (!userAmount.gt(0)) {
      return NEW_ERROR("canPerformLendingTx: amount must be greater than 0");
    }
    switch (txParams.txType) {
      case CTokenLendingTxTypes.SUPPLY:
      // check user has enough balance
      case CTokenLendingTxTypes.REPAY: {
        // check user has enough balance and borrow balance to pay back
        const { data: userBalance, error: userBalanceError } =
          convertToBigNumber(txParams.cToken.userDetails.balanceOfUnderlying);
        if (userBalanceError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(userBalanceError));
        }
        if (txParams.txType === CTokenLendingTxTypes.REPAY) {
          return NO_ERROR(
            userAmount.lte(userBalance) &&
              userAmount.lte(txParams.cToken.userDetails.borrowBalance)
          );
        }
        return NO_ERROR(userAmount.lte(userBalance));
      }
      case CTokenLendingTxTypes.BORROW:
        // check borrow limit
        const { data: borrowLimit, error: borrowLimitError } =
          cTokenBorrowLimit(txParams.cToken, position.liquidity);
        if (borrowLimitError) {
          return NEW_ERROR("canPerformLendingTx::" + errMsg(borrowLimitError));
        }
        return NO_ERROR(borrowLimit.gte(userAmount));
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
        if (txParams.txType === CTokenLendingTxTypes.WITHDRAW) {
          return NO_ERROR(
            withdrawLimit.gte(userAmount) &&
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
        return NEW_ERROR(
          "canPerformLendingTx: invalid type: " + txParams.txType
        );
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
