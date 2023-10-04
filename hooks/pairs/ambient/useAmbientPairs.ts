import { useQuery } from "react-query";
import { AmbientHookInputParams } from "./interfaces/hookParams";
import { getGeneralAmbientPairData } from "./helpers/ambientPairData";
import { getAmbientPairsFromChainId } from "./config/ambientPairs";

export default function useAmbientPairs(
  params: AmbientHookInputParams,
  options?: {
    refetchInterval?: number;
  }
) {
  const { data: ambientPairs } = useQuery(
    ["ambientPairs", params.chainId, params.userEthAddress],
    async () => {
      const pairs = getAmbientPairsFromChainId(params.chainId);
      return (
        (await getGeneralAmbientPairData(params.chainId, pairs)).data ?? []
      );
    },
    {
      onSuccess: (response) => {
        console.log(response);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: options?.refetchInterval || 5000,
    }
  );
  return { ambientPairs };
}
