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
  Validation,
} from "@/config/interfaces";
import { areEqualAddresses } from "@/utils/address";
import {
  addTokenBalances,
  validateWeiUserInputTokenAmount,
} from "@/utils/math";
import { createNewCantoDexTxFLow } from "./helpers/createPairsFlow";
import { createNewClaimCLMRewardsFlow } from "@/hooks/lending/helpers/createLendingFlow";
import { USER_INPUT_ERRORS } from "@/config/consts/errors";

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
  const { data: pairs, isLoading } = useQuery(
    ["canto dex", params.chainId],
    async (): Promise<CantoDexPair[]> => {
      const { data, error } = await getCantoApiData<CantoDexPair[]>(
        params.chainId,
        CANTO_DATA_API_ENDPOINTS.allPairs
      );
      if (error) throw error;
      // sort data to make it more predictable
      return data.sort((a, b) => a.address.localeCompare(b.address));
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

  function validateParams(txParams: CantoDexTransactionParams): Validation {
    // make sure user eth address is the same
    if (!areEqualAddresses(params.userEthAddress ?? "", txParams.ethAccount)) {
      return {
        error: true,
        reason: USER_INPUT_ERRORS.ACCOUNT_MISMATCH(),
      };
    }
    if (!txParams.pair.clmData?.userDetails) {
      return {
        error: true,
        reason: USER_INPUT_ERRORS.PROP_UNAVAILABLE("userDetails"),
      };
    }
    // save user details to variable to stop repetition
    const pair = txParams.pair;
    const userDetails = txParams.pair.clmData.userDetails;
    // make sure balances are good depending on tx type
    switch (txParams.txType) {
      case CantoDexTxTypes.ADD_LIQUIDITY: {
        // check slippage and deadline
        if (Number(txParams.slippage) < 0 || Number(txParams.slippage) > 100) {
          return { error: true, reason: USER_INPUT_ERRORS.SLIPPAGE_ERROR() };
        }
        if (Number(txParams.deadline) <= 0) {
          return { error: true, reason: USER_INPUT_ERRORS.DEADLINE_ERROR() };
        }
        const token1 = pair.token1;
        const token2 = pair.token2;
        // each token value must be less than or equal to their balance
        const [token1Check, token2Check] = [
          validateWeiUserInputTokenAmount(
            txParams.amounts.amount1,
            "0",
            token1.balance ?? "0",
            token1.symbol,
            token1.decimals
          ),
          validateWeiUserInputTokenAmount(
            txParams.amounts.amount2,
            "0",
            token2.balance ?? "0",
            token2.symbol,
            token2.decimals
          ),
        ];
        if (token1Check.error) return token1Check;
        return token2Check;
      }
      case CantoDexTxTypes.REMOVE_LIQUIDITY:
        // check slippage and deadline
        if (Number(txParams.slippage) < 0 || Number(txParams.slippage) > 100) {
          return { error: true, reason: USER_INPUT_ERRORS.SLIPPAGE_ERROR() };
        }
        if (Number(txParams.deadline) <= 0) {
          return { error: true, reason: USER_INPUT_ERRORS.DEADLINE_ERROR() };
        }
        // if unstaking first, check supplyBalance, otherwise check balanceOfUnderlying
        return validateWeiUserInputTokenAmount(
          txParams.amountLP,
          "0",
          addTokenBalances(
            userDetails.supplyBalanceInUnderlying,
            userDetails.balanceOfUnderlying
          ),
          pair.symbol,
          pair.decimals
        );
      case CantoDexTxTypes.STAKE:
        return validateWeiUserInputTokenAmount(
          txParams.amountLP,
          "0",
          userDetails.balanceOfUnderlying,
          pair.symbol,
          pair.decimals
        );
      case CantoDexTxTypes.UNSTAKE:
        return validateWeiUserInputTokenAmount(
          txParams.amountLP,
          "0",
          userDetails.supplyBalanceInUnderlying,
          pair.symbol,
          pair.decimals
        );
      default:
        return {
          error: true,
          reason: "tx type not found",
        };
    }
  }

  function createNewPairsFlow(
    params: CantoDexTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    // validate params
    const validation = validateParams(params);
    if (validation.error)
      return NEW_ERROR("createNewPairsFlow::" + validation.reason);
    return createNewCantoDexTxFLow(params);
  }

  function createNewClaimRewardsFlow(): ReturnWithError<NewTransactionFlow> {
    return createNewClaimCLMRewardsFlow({
      chainId: params.chainId,
      ethAccount: params.userEthAddress ?? "",
      estimatedRewards: position.totalRewards,
    });
  }

  return {
    isLoading,
    pairs: pairsWithUserCTokens ?? [],
    position,
    transaction: {
      validateParams,
      createNewPairsFlow,
      createClaimRewardsFlow: createNewClaimRewardsFlow,
    },
  };
}
