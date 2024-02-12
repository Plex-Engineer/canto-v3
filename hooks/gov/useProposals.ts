import { useQuery } from "react-query";
import {
  ProposalHookParams,
  ProposalHookReturn,
} from "./interfaces/hookParams";
import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import { Proposal } from "./interfaces/proposal";
import { newVoteFlow } from "@/transactions/gov";

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
        CANTO_DATA_API_ENDPOINTS.allProposals
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
    newVoteFlow: (txParams) => newVoteFlow(txParams),
  };
}
