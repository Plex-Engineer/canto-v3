import {
  CANTO_DATA_API_ENDPOINTS,
  CANTO_DATA_API_URL,
  GeneralPairResponse,
} from "@/config/consts/apiUrls";
import { tryFetch } from "@/utils/async.utils";
import { useQuery } from "react-query";
import useTokenBalances from "../helpers/useTokenBalances";
import { PairsHookInputParams } from "./interfaces/hookParams";
import { Pair } from "./interfaces/pairs";
import { useState } from "react";
import { ERC20Token } from "@/config/interfaces/tokens";

export default function usePairs(params: PairsHookInputParams) {
  const { data: pairs } = useQuery(
    "lp pairs",
    async (): Promise<Pair[]> => {
      const { data, error } = await tryFetch<{ pairs: GeneralPairResponse[] }>(
        CANTO_DATA_API_URL + CANTO_DATA_API_ENDPOINTS.allPairs
      );
      if (error) throw error;
      const formattedPairs = data.pairs.map((pair) => {
        return {
          ...pair,
          token1: {
            ...pair.token1,
            id: pair.token1.address,
            chainId: Number(pair.token1.chainId),
            icon: pair.token1.logoURI,
          },
          token2: {
            ...pair.token2,
            id: pair.token2.address,
            chainId: Number(pair.token2.chainId),
            icon: pair.token2.logoURI,
          },
        };
      });
      // crete set of underlying tokens
      const erc20Tokens = new Map<string, ERC20Token>();
      formattedPairs.forEach((pair) => {
        if (!erc20Tokens.has(pair.token1.id)) {
          erc20Tokens.set(pair.token1.id, pair.token1);
        }
        if (!erc20Tokens.has(pair.token2.id)) {
          erc20Tokens.set(pair.token2.id, pair.token2);
        }
      });
      setUnderlyingTokens(Array.from(erc20Tokens.values()));


      return formattedPairs;
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: 10000,
    }
  );
  // save set of ERC20 tokens to use for balances, some pairs will have the same underlying tokens
  const [underlyingTokens, setUnderlyingTokens] = useState<ERC20Token[]>([]);
  const tokenBalances = useTokenBalances(
    params.chainId,
    underlyingTokens,
    params.userEthAddress
  );
  return { pairs };
}
