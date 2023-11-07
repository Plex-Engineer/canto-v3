import { useQuery } from "react-query";
import { CTokenWithUserData } from "./interfaces/tokens";
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
import { UserLMPosition } from "./interfaces/userPositions";
import { useEffect, useState } from "react";
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
  // internal state for tokens and position (ONLY SET ON SUCCESS)
  // stops failed queries from overwriting the data with empty arrays
  const [cTokens, setCTokens] = useState<CTokenWithUserData[]>([]);
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
      // get tokens
      const cTokenAddresses = getCTokenAddressesFromChainId(
        params.chainId,
        params.lmType
      );
      if (!cTokenAddresses) throw Error("useLending: chainId not supported");
      return await getAllUserCLMData(
        params.userEthAddress ?? "",
        params.chainId,
        cTokenAddresses
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
        setCTokens(response.data.cTokens);
        response.data.position && setPosition(response.data.position);
      },
      refetchInterval: options?.refetchInterval || 5000,
    }
  );
  ///
  /// Internal Hooks
  ///
  // reset cTokens and position on chainId change
  useEffect(() => {
    setCTokens([]);
    setPosition({
      liquidity: "0",
      shortfall: "0",
      totalSupply: "0",
      totalBorrow: "0",
      totalRewards: "0",
      avgApr: "0",
    });
  }, [params.chainId]);

  // keep track of selected token so we can return it with proper balances
  const [selectedCTokenAddress, setSelectedCTokenAddress] = useState<
    string | null
  >(null);
  // get token from constantly updating list of cTokens
  const selectedCToken = cTokens.find((cToken) =>
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
    return lendingTxParamCheck(txParams, position);
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
    cTokens,
    position,
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
