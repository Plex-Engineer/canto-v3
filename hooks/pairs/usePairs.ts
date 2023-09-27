import { useQuery } from "react-query";
import { PairsHookInputParams } from "./interfaces/hookParams";
import { Pair } from "./interfaces/pairs";
import { CANTO_DATA_API_ENDPOINTS } from "@/config/api";
import { getCantoApiData } from "@/config/api/canto-api";
import useLending from "../lending/useLending";

export default function usePairs(params: PairsHookInputParams) {
  // since LP tokens are part of the clm, we need to query the cLP tokens in useLending
  // need the cLP tokens, user position, and transaction functions
  const {
    cTokens: cLPTokens,
    position,
    transaction: clmTxs,
  } = useLending({ ...params, cTokenType: "lp" });

  const { data: pairs } = useQuery(
    ["lp pairs", params.chainId],
    async (): Promise<Pair[]> => {
      const { data, error } = await getCantoApiData<Pair[]>(
        params.chainId,
        CANTO_DATA_API_ENDPOINTS.allPairs
      );
      if (error) throw error;
      return data;
      // const formattedPairs = data.map((pair) => {
      //   return {
      //     ...pair,
      //     token1: {
      //       ...pair.token1,
      //       id: pair.token1.address,
      //       chainId: Number(pair.token1.chainId),
      //       icon: pair.token1.logoURI,
      //     },
      //     token2: {
      //       ...pair.token2,
      //       id: pair.token2.address,
      //       chainId: Number(pair.token2.chainId),
      //       icon: pair.token2.logoURI,
      //     },
      //   };
      // });
      // // crete set of underlying tokens
      // const erc20Tokens = new Map<string, ERC20Token>();
      // formattedPairs.forEach((pair) => {
      //   if (!erc20Tokens.has(pair.token1.id)) {
      //     erc20Tokens.set(pair.token1.id, pair.token1);
      //   }
      //   if (!erc20Tokens.has(pair.token2.id)) {
      //     erc20Tokens.set(pair.token2.id, pair.token2);
      //   }
      // });
      // return formattedPairs;
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
  const pairsWithUserCTokens = pairs?.map((pair) => {
    const cLPToken = cLPTokens?.find(
      (cToken) => cToken.address === pair.cLpAddress
    );
    if (!cLPToken) return pair;
    return {
      ...pair,
      clmData: cLPToken,
    };
  });
  return { pairsWithUserCTokens };
}
