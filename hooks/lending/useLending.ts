import { useQuery } from "react-query";
import { CTokenWithUserData } from "./interfaces/tokens";
import { CTokenLendingTransactionParams } from "./interfaces/lendingTxTypes";
import { NEW_ERROR, ReturnWithError } from "@/config/interfaces/errors";
import {
  LendingHookInputParams,
  LendingHookReturn,
} from "./interfaces/hookParams";
import { UserLMPosition } from "./interfaces/userPositions";
import { useState } from "react";
import { lendingTxParamCheck } from "@/utils/clm/txParamCheck.utils";
import { getAllUserCLMData } from "./helpers/userClmData";
import { createNewCTokenLendingFlow } from "./helpers/createLendingFlow";

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
  const { isLoading: loadingCTokens } = useQuery(
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
    return lendingTxParamCheck(txParams, position);
  }

  return {
    tokens,
    position,
    loading: loadingCTokens,
    transaction: {
      canPerformLendingTx,
      createNewLendingFlow: createNewCTokenLendingFlow,
    },
  };
}
