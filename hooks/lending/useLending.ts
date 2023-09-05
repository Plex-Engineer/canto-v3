import {
  CANTO_DATA_API_ENDPOINTS,
  CANTO_DATA_API_URL,
  GeneralCTokenResponse,
  USER_CANTO_DATA_API_ENDPOINTS,
  USER_CANTO_DATA_API_URL,
  UserDataResponse,
} from "@/config/consts/apiUrls";
import { tryFetch } from "@/utils/async.utils";
import { useQuery } from "react-query";
import { CToken, FormattedCToken } from "./interfaces/tokens";
import { useState } from "react";
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

export default function useLending() {
  const [allCtokens, setAllCtokens] = useState<CToken[]>([]);
  const [allUserCTokens, setAllUserCTokens] = useState<{
    [key: string]: object;
  }>({});
  const [userLiquidity, setUserLiquidity] = useState<{
    error: string;
    liquidity: string;
    shortfall: string;
  }>();
  const { isLoading: generalLoading, error: generalError } = useQuery(
    "lending",
    async () => {
      const { data: cTokens, error: cTokenError } =
        await tryFetch<GeneralCTokenResponse>(
          CANTO_DATA_API_URL + CANTO_DATA_API_ENDPOINTS.allCTokens
        );
      if (cTokenError) {
        throw cTokenError;
      }
      return cTokens.cTokens;
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess(data) {
        setAllCtokens(data);
      },
      refetchInterval: 5000,
    }
  );

  const { isLoading: userLoading, error: userError } = useQuery(
    "userLending",
    async () => {
      const { data: cTokens, error: cTokenError } =
        await tryFetch<UserDataResponse>(
          USER_CANTO_DATA_API_URL +
            USER_CANTO_DATA_API_ENDPOINTS.userData(
              ""
            )
        );
      if (cTokenError) {
        throw cTokenError;
      }
      console.log(cTokens);
      return {
        ctokens: cTokens.user.lending.cToken,
        accountLiquidity: cTokens.user.lending.liquidity,
      };
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess(data) {
        setAllUserCTokens(data.ctokens);
        setUserLiquidity({
            error: data.accountLiquidity[0],
            liquidity: data.accountLiquidity[1],
            shortfall: data.accountLiquidity[2],
        });
      },
      refetchInterval: 5000,
    }
  );

  const formattedUserCTokens: FormattedCToken[] = allCtokens
    .map((cToken) => {
      const userCToken = allUserCTokens[cToken.address];
      if (userCToken) {
        return {
          ...cToken,
          userDetails: Object.fromEntries(
            Object.entries(userCToken).map(([key, value]) => [key, value[0]])
          ),
        };
      }
      return cToken;
    })
    .sort((a, b) => {
      if (a.symbol < b.symbol) {
        return -1;
      }
      if (a.symbol > b.symbol) {
        return 1;
      }
      return 0;
    }) as FormattedCToken[];

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
    formattedUserCTokens,
    accountLiquidity: userLiquidity,
    generalLoading,
    generalError,
    userLoading,
    userError,
  };
}
