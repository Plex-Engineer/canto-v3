import { NEW_ERROR, NO_ERROR, PromiseWithError, errMsg } from "@/config/interfaces";
import { tryFetch } from "@/utils/async.utils";
import { useEffect, useState } from "react";
import { castVoteTest, voteTxParams } from "./transactions/vote";
import { useWalletClient } from "wagmi";
import { getCosmosAPIEndpoint } from "@/utils/networks.utils";


interface Proposal {
    proposal_id: string;
    title: string;
    status: string;
    voting_end_time: string;
    votes_yes : string;
    votes_abstain : string;
    votes_no : string;
    votes_no_with_veto : string;
}
  
interface UseSingleProposalsResult {
    proposals: Proposal[];
    loading: boolean;
    error: Error | null;
}

async function useSingleProposalResult(id:string | undefined):PromiseWithError<Proposal>{

    const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(7700);
    if (urlError) {
        return NEW_ERROR("getCosmosTokenBalance::" + errMsg(urlError));
    }
    const{data:result, error: proposalsFetchError} = await tryFetch<{
            proposal: any;
        }>(nodeURL+"/cosmos/gov/v1beta1/proposals/"+id);

    if(proposalsFetchError){
        return NEW_ERROR("fetching proposals failed: "+errMsg(proposalsFetchError));
    }
    console.log(result);
    console.log(result.proposal);
    const proposalData = result.proposal;
    const extractedProposal : Proposal = {
            proposal_id: proposalData.proposal_id,
            title: proposalData.content.title, //- for the mainnode url, include this
            status: proposalData.status,
            voting_end_time: proposalData.voting_end_time,
            votes_yes : proposalData.final_tally_result.yes,
            votes_abstain : proposalData.final_tally_result.abstain,
            votes_no : proposalData.final_tally_result.no,
            votes_no_with_veto : proposalData.final_tally_result.no_with_veto
    };

    return NO_ERROR(extractedProposal);
}


export function useSingleProposal(id: string | undefined) {

    // const [delegations, setDelegations] = useState<DelegationResponse[]>([]);
    // const totalUserStake = calculateTotalStaked(delegations);
    // const [totalGlobalStake, setTotalGlobalStake] = useState(BigNumber.from(0));
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    async function getProposalsResult(){
        const {data: proposalRes, error: proposalsError} = await useSingleProposalResult(id);
        if(proposalsError){
          setError(proposalsError);
          setLoading(false);
        }
        if(proposalRes){
          setProposal(proposalRes);
          setLoading(false);
        }
    }
      useEffect(() => {
        getProposalsResult();
      }, []);

    const voteTx = (params: voteTxParams): void => {
    castVoteTest(params);
    // You can also handle any additional logic related to voting here
    };

    return { proposal, loading, error,voteTx };
}

//export default useSingleProposal;