import { useQuery } from "react-query";
import { CTokenLendingTransactionParams } from "./interfaces/lendingTxTypes";
import {
  NEW_ERROR,
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import {
  LendingHookInputParams,
  LendingHookReturn,
} from "./interfaces/hookParams";
import { useState } from "react";
import { lendingTxParamCheck } from "@/utils/clm";
import { getAllUserCLMData } from "./helpers/userClmData";
import { createNewCTokenLendingFlow } from "./helpers/createLendingFlow";
import { areEqualAddresses } from "@/utils/address";
import { getCTokenAddressesFromChainId } from "./config/cTokenAddresses";

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

  ///
  /// external functions
  ///
  function validateParams(
    txParams: CTokenLendingTransactionParams
  ): ValidationReturn {
    // make sure all the info we have is from the eth account
    if (!areEqualAddresses(txParams.ethAccount, params.userEthAddress ?? "")) {
      return {
        isValid: false,
        errorMessage: "Transaction not from current account",
      };
    }
    // make sure user position is available
    if (!clmData?.position) {
      return {
        isValid: false,
        errorMessage: "User position not available",
      };
    }
    return lendingTxParamCheck(txParams, clmData.position);
  }

  function createNewLendingFlow(
    txParams: CTokenLendingTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateParams(txParams);
    if (!validation.isValid)
      return NEW_ERROR("createNewLendingFlow::" + validation.errorMessage);
    return createNewCTokenLendingFlow(txParams);
  }

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
      validateParams,
      createNewLendingFlow,
    },
  };
}
