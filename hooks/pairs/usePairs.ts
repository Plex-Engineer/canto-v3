import { useQuery } from "react-query";
import { PairsHookInputParams, PairsHookReturn } from "./interfaces/hookParams";
import { Pair, PairWithUserCTokenData } from "./interfaces/pairs";
import { CANTO_DATA_API_ENDPOINTS } from "@/config/api";
import { getCantoApiData } from "@/config/api/canto-api";
import useLending from "../lending/useLending";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { createNewPairsTxFlow } from "./helpers/createPairsFlow";
import { getOptimalValueBFormatted } from "./helpers/addLiquidityValues";
import useTokenBalances from "../helpers/useTokenBalances";
import { getUniqueUnderlyingTokensFromPairs } from "./helpers/underlyingTokens";
import { areEqualAddresses } from "@/utils/address.utils";
import { useState } from "react";

export default function usePairs(
  params: PairsHookInputParams
): PairsHookReturn {
  ///
  /// Internal Hooks
  ///

  // query for all pair data
  const { data: pairs } = useQuery(
    ["lp pairs", params.chainId],
    async (): Promise<Pair[]> => {
      const { data, error } = await getCantoApiData<Pair[]>(
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
      refetchInterval: 10000,
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
    cTokenType: "lp",
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
  /// internal functions
  ///

  // state for the pair so that balances can always update
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  // get the pair from the pair list with balances
  function getPair(address: string): ReturnWithError<PairWithUserCTokenData> {
    const pair = pairsWithUserCTokens?.find((pair) =>
      areEqualAddresses(pair.address, address)
    );
    return pair ? NO_ERROR(pair) : NEW_ERROR("Pair not found");
  }

  ///
  /// external functions
  ///

  // function for getting optimal amount of token 2
  const getOptimalAmount = async (
    amountChanged: 1 | 2,
    pair: PairWithUserCTokenData,
    amount: string
  ) =>
    getOptimalValueBFormatted({
      chainId: params.chainId,
      pair,
      valueChanged: amountChanged,
      amount,
    });

  return {
    pairs: pairsWithUserCTokens ?? [],
    position,
    amounts: {
      getOptimalAmount1: async (amount, pair) =>
        getOptimalAmount(2, pair, amount),
      getOptimalAmount2: async (amount, pair) =>
        getOptimalAmount(1, pair, amount),
    },
    selection: {
      pair: getPair(selectedPairId ?? "").data,
      setPair: setSelectedPairId,
    },
    transaction: {
      canPerformPairsTx: () => NO_ERROR(false),
      createNewPairsFlow: createNewPairsTxFlow,
    },
  };
}
