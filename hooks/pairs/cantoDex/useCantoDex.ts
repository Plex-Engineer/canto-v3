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
  newCantoDexLPFlow,
  validateCantoDexLPTxParams,
} from "@/transactions/pairs/cantoDex";

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
  const {
    cTokens: cLPTokens,
    position,
    transaction: clmTransaction,
  } = useLending({
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

  return {
    isLoading,
    pairs: pairsWithUserCTokens ?? [],
    position,
    transaction: {
      validateParams: (txParams) => validateCantoDexLPTxParams(txParams),
      newCantoDexLPFlow: (params) => newCantoDexLPFlow(params),
      newClaimRewardsFlow: () =>
        clmTransaction.newClaimRewardsFlow({
          chainId: params.chainId,
          ethAccount: params.userEthAddress ?? "",
          estimatedRewards: position.totalRewards,
        }),
    },
  };
}
