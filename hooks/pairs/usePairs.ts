import { tryFetch } from "@/utils/async.utils";
import { useQuery } from "react-query";
import { PairsHookInputParams } from "./interfaces/hookParams";
import { Pair } from "./interfaces/pairs";
import { ERC20Token } from "@/config/interfaces/tokens";
import { CANTO_DATA_API_ENDPOINTS, CANTO_DATA_BASE_URL } from "@/config/api";

export default function usePairs(params: PairsHookInputParams) {
  const { data: pairs } = useQuery(
    "lp pairs",
    async (): Promise<Pair[]> => {
      const { data, error } = await tryFetch<{ pairs: GeneralPairResponse[] }>(
        CANTO_DATA_BASE_URL(params.chainId) + CANTO_DATA_API_ENDPOINTS.allPairs
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
  return { pairs };
}
