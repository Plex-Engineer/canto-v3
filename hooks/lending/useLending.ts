import { useQuery } from "react-query";
import {
  LendingHookInputParams,
  LendingHookReturn,
} from "./interfaces/hookParams";
import { useState } from "react";
import { getAllUserCLMData } from "./helpers/userClmData";
import { getVivacityLMData } from "./helpers/vivacityLmData";
import { areEqualAddresses } from "@/utils/address";
import { getCTokenAddressesFromChainId } from "./config/cTokenAddresses";
import {
  Vivacity,
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
  params: LendingHookInputParams
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

      const [clmData, vcNoteData] = await Promise.all([
        getAllUserCLMData(
        params.userEthAddress ?? "",
        params.chainId,
        cTokenAddresses
      ),
      getVivacityLMData(params.userEthAddress ?? "", params.chainId),
    ])
      if (clmData.error) throw clmData.error;

      if (vcNoteData.error) throw vcNoteData.error;

      return {
        ...clmData.data,
        vcNote : vcNoteData.data.vcNote
      };
    },
    {
      onError: (error) => {
        console.log(error);
      },
      placeholderData: {
        cTokens: [],
        vcNote: undefined,
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
  const selectedCToken = selectedCTokenAddress == clmData?.vcNote?.address ? clmData?.vcNote :clmData?.cTokens.find((cToken) =>
    areEqualAddresses(cToken.address, selectedCTokenAddress ?? "")
  );

  return {
    cTokens: clmData?.cTokens ?? [],
    vcNote: clmData?.vcNote ,
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
      validateVivacityParams : (txParams) => Vivacity.validateCTokenLendingTxParams(txParams),
      newVivacityLendingFlow : (txParams) => Vivacity.newCTokenLendingFlow(txParams),
    },
  };
}
