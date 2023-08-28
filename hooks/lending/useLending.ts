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

export default function useLending() {
  const [allCtokens, setAllCtokens] = useState<CToken[]>([]);
  const [allUserCTokens, setAllUserCTokens] = useState<{
    [key: string]: object;
  }>({});
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
              "0x8915da99B69e84DE6C97928d378D9887482C671c"
            )
        );
      if (cTokenError) {
        throw cTokenError;
      }
      return cTokens.user.lending.cToken;
    },
    {
      onError: (error) => {
        console.log(error);
      },
      onSuccess(data) {
        setAllUserCTokens(data);
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

  return {
    formattedUserCTokens,
    generalLoading,
    generalError,
    userLoading,
    userError,
  };
}
