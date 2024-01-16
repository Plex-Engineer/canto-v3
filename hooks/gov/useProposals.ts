import { useQuery } from "react-query";
import {
  ProposalHookParams,
  ProposalHookReturn,
} from "./interfaces/hookParams";
import { getCantoApiData } from "@/config/api";
import { Proposal } from "./interfaces/proposal";

export default function useProposals(
  params: ProposalHookParams,
  options?: {
    refetchInterval?: number;
  }
): ProposalHookReturn {
  // just need to fetch all proposals for this hook
  const { data: proposals, isLoading } = useQuery(
    ["proposals", params.chainId],
    async () => {
      const { data: proposals, error } = await getCantoApiData<Proposal[]>(
        params.chainId,
        "/v1/gov/proposals"
      );
      if (error) throw error;
      return proposals;
    },
    {
      onSuccess: (data) => {
        // console.log("data", data);
      },
      onError: (error) => {
        console.error("error", error);
      },
    }
  );
  return {
    proposals: proposals ?? [],
    isProposalsLoading: isLoading,
  };
}
