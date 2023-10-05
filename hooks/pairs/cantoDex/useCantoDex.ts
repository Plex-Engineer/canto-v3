import { useQuery } from "react-query";
import {
  CantoDexHookInputParams,
  CantoDexHookReturn,
} from "./interfaces/hookParams";
import { CantoDexPair } from "./interfaces/pairs";
import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import useTokenBalances from "@/hooks/helpers/useTokenBalances";
import { getUniqueUnderlyingTokensFromPairs } from "./helpers/underlyingTokens";
import useLending from "@/hooks/lending/useLending";
import {
  CantoDexTransactionParams,
  CantoDexTxTypes,
} from "./interfaces/pairsTxTypes";
import {
  NEW_ERROR,
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import { areEqualAddresses } from "@/utils/address.utils";
import { validateInputTokenAmount } from "@/utils/validation.utils";
import { createNewPairsTxFlow } from "./helpers/createPairsFlow";

export default function useCantoDex(
  params: CantoDexHookInputParams,
  options?: {
    refetchInterval?: number;
  }
): CantoDexHookReturn {
  ///
  /// Internal Hooks
  ///

  // query for all pair data
  const { data: pairs } = useQuery(
    ["canto dex", params.chainId],
    async (): Promise<CantoDexPair[]> => {
      const { data, error } = await getCantoApiData<CantoDexPair[]>(
        params.chainId,
        CANTO_DATA_API_ENDPOINTS.allPairs
      );
      if (error) throw error;
      return data;
    },
    {
      onSuccess: (data) => {
        // console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: options?.refetchInterval ?? 5000,
    }
  );
  // get balances of all the underlying tokens
  const underlyingTokenBalances = useTokenBalances(
    params.chainId,
    getUniqueUnderlyingTokensFromPairs(params.chainId, pairs ?? []),
    params.userEthAddress
  );
  // since LP tokens are part of the clm, we need to query the cLP tokens in useLending
  // need the cLP tokens, user position, and transaction functions
  const { cTokens: cLPTokens, position } = useLending({
    ...params,
    lmType: "lp",
  });
  // attach clm data with pairs
  const pairsWithUserCTokens = pairs?.map((pair) => {
    const cLPToken = cLPTokens?.find(
      (cToken) => cToken.address === pair.cLpAddress
    );
    // just return the pair if no clm data
    if (!cLPToken) return pair;

    // try to get the underlying token balances
    const underlyingToken1Balance =
      underlyingTokenBalances[pair.token1.address];
    const underlyingToken2Balance =
      underlyingTokenBalances[pair.token2.address];

    // return what we have if no balances found
    if (!underlyingToken1Balance || !underlyingToken2Balance)
      return { ...pair, clmData: cLPToken };

    return {
      ...pair,
      token1: { ...pair.token1, balance: underlyingToken1Balance },
      token2: { ...pair.token2, balance: underlyingToken2Balance },
      clmData: cLPToken,
    };
  });

  ///
  /// external functions
  ///

  function validateParams(
    txParams: CantoDexTransactionParams
  ): ValidationReturn {
    // make sure user eth address is the same
    if (!areEqualAddresses(params.userEthAddress ?? "", txParams.ethAccount)) {
      return {
        isValid: false,
        errorMessage: "user eth address is not the same",
      };
    }
    if (!txParams.pair.clmData?.userDetails) {
      return {
        isValid: false,
        errorMessage: "pair clm data not found",
      };
    }
    // save user details to variable to stop repetition
    const pair = txParams.pair;
    const userDetails = txParams.pair.clmData.userDetails;
    // make sure balances are good depending on tx type
    switch (txParams.txType) {
      case CantoDexTxTypes.ADD_LIQUIDITY: {
        const token1 = pair.token1;
        const token2 = pair.token2;
        // each token value must be less than or equal to their balance
        const [token1Check, token2Check] = [
          validateInputTokenAmount(
            txParams.amounts.amount1,
            token1.balance ?? "0",
            token1.symbol,
            token1.decimals
          ),
          validateInputTokenAmount(
            txParams.amounts.amount2,
            token2.balance ?? "0",
            token2.symbol,
            token2.decimals
          ),
        ];
        const prefixError = !token1Check.isValid
          ? token1.symbol
          : token2.symbol;
        return {
          isValid: token1Check.isValid && token2Check.isValid,
          errorMessage:
            prefixError +
            (token1Check.errorMessage || token2Check.errorMessage),
        };
      }
      case CantoDexTxTypes.REMOVE_LIQUIDITY:
        // if unstaking first, check supplyBalance, otherwise check balanceOfUnderlying
        return validateInputTokenAmount(
          txParams.amountLP,
          txParams.unstake
            ? userDetails.supplyBalanceInUnderlying
            : userDetails.balanceOfUnderlying,
          pair.symbol,
          pair.decimals
        );
      case CantoDexTxTypes.STAKE:
        return validateInputTokenAmount(
          txParams.amountLP,
          userDetails.balanceOfUnderlying,
          pair.symbol,
          pair.decimals
        );
      case CantoDexTxTypes.UNSTAKE:
        return validateInputTokenAmount(
          txParams.amountLP,
          userDetails.supplyBalanceInUnderlying,
          pair.symbol,
          pair.decimals
        );
      default:
        return {
          isValid: false,
          errorMessage: "tx type not found",
        };
    }
  }

  function createNewPairsFlow(
    params: CantoDexTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    // validate params
    const validation = validateParams(params);
    if (!validation.isValid)
      return NEW_ERROR("createNewPairsFlow::" + validation.errorMessage);
    return createNewPairsTxFlow(params);
  }

  return {
    pairs: pairsWithUserCTokens ?? [],
    position,
    transaction: {
      validateParams,
      createNewPairsFlow,
    },
  };
}
