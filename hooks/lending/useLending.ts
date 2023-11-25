import { useQuery } from "react-query";
import {
  LendingHookInputParams,
  LendingHookReturn,
} from "./interfaces/hookParams";
import { useState } from "react";
import { getAllUserCLMData } from "./helpers/userClmData";
import { areEqualAddresses } from "@/utils/address";
import { getCTokenAddressesFromChainId } from "./config/cTokenAddresses";
import {
  newCTokenLendingFlow,
  newClaimCLMRewardsFlow,
  validateCTokenLendingTxParams,
} from "@/transactions/lending";

/**
 * @name useLending
 * @description Hook for Canto Lending Market Tokens and User Data
 * @returns
 */
export default function useLending(
  params: LendingHookInputParams,
  options?: {
    refetchInterval?: number;
  }
): LendingHookReturn {
  // use query to get all general and user cToken data
  const { data: clmData, isLoading: loadingCTokens } = useQuery(
    ["lending", params.chainId, params.userEthAddress],
    async () => {
      // get tokens
      const cTokenAddresses = getCTokenAddressesFromChainId(
        params.chainId,
        params.lmType
      );
      if (!cTokenAddresses) throw Error("useLending: chainId not supported");
      const clmData = await getAllUserCLMData(
        params.userEthAddress ?? "",
        params.chainId,
        cTokenAddresses
      );
      if (clmData.error) throw clmData.error;
      return clmData.data;
    },
    {
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: options?.refetchInterval || 5000,
      placeholderData: {
        cTokens: [],
        position: undefined,
      },
    }
  );
  ///
  /// Internal Hooks
  ///

  // keep track of selected token so we can return it with proper balances
  const [selectedCTokenAddress, setSelectedCTokenAddress] = useState<
    string | null
  >(null);
  // get token from constantly updating list of cTokens
  const selectedCToken = clmData?.cTokens.find((cToken) =>
    areEqualAddresses(cToken.address, selectedCTokenAddress ?? "")
  );

  return {
    cTokens: clmData?.cTokens ?? [],
    position: clmData?.position ?? {
      liquidity: "0",
      shortfall: "0",
      totalSupply: "0",
      totalBorrow: "0",
      totalRewards: "0",
      avgApr: "0",
    },
    isLoading: loadingCTokens,
    selection: {
      selectedCToken,
      setSelectedCToken: setSelectedCTokenAddress,
    },
    transaction: {
      validateParams: (txParams) => validateCTokenLendingTxParams(txParams),
      newLendingFlow: (txParams) => newCTokenLendingFlow(txParams),
      newClaimRewardsFlow: (txParams) => newClaimCLMRewardsFlow(txParams),
    },
  };
}
