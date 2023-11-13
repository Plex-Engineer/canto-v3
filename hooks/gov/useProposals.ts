import { useQuery } from "react-query";
import {
  ProposalHookParams,
  ProposalHookReturn,
} from "./interfaces/hookParams";
import { getCantoApiData } from "@/config/api";
import { Proposal } from "./interfaces/proposal";
import { NEW_ERROR, errMsg } from "@/config/interfaces";

export default function useProposals(
  params: ProposalHookParams,
  options?: {
    refetchInterval?: number;
  }
): ProposalHookReturn {
  ///
  /// INTERNAL HOOKS
  ///

  // just need to fetch all proposals for this hook
  const { data: proposals } = useQuery(
    ["proposals", params.chainId],
    async () => {
      const { data: proposals, error } = await getCantoApiData<Proposal[]>(
        params.chainId,
        "/v1/gov/proposals"
      );
      if (error) throw error;
      //const proposalData = JSON.parse(proposals);
      return proposals;
    },
    {
      onSuccess: (data) => {
        // console.log("data", data);
      },
      onError: (error) => {
        console.log("error", error);
      },
    }
  );
  //console.log(proposals);
  if(proposals){
    //console.log(JSON.parse(proposals));
    return {
      proposals: proposals
    };
  }
  return {
    proposals :[]
  }

  
}