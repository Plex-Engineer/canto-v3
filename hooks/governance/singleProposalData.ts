import { useEffect, useState } from "react";


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
  
interface UseGovernanceProposalsResult {
    proposals: Proposal[];
    loading: boolean;
    error: Error | null;
}

const SINGLE_PROPOSAL_API_ENDPOINT = 'https://mainnode.plexnode.org:1317/cosmos/gov/v1beta1/proposals/';



function useSingleProposal(id: string) {
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {

        console.log(SINGLE_PROPOSAL_API_ENDPOINT+id);
        // Fetch the governance proposals from the API
        fetch(SINGLE_PROPOSAL_API_ENDPOINT+id)
        .then((response) => response.json())
        .then((data) => {
            const extractedProposal = data;
            const votingEndTime = new Date(data.voting_end_time);
            const now = new Date();
            const timeDifference = now.getTime() - votingEndTime.getTime();
            const daysSinceVotingEnd = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const final_tally_result = data.final_tally_result;
            const votesYes = final_tally_result?.yes;
            const votesNo = final_tally_result?.no;
            const votesAbstain = final_tally_result?.abstain;
            const votesNo_with_veto = final_tally_result?.no_with_veto;
            console.log(final_tally_result);
            const proposal_res:Proposal = {
                proposal_id: data.proposal_id,
                title: data.content.title,
                status: data.status,
                voting_end_time: data.voting_end_time,
                votes_yes : votesYes,
                votes_abstain : votesAbstain,
                votes_no : votesNo,
                votes_no_with_veto : votesNo_with_veto
            };
            setProposal(proposal_res); // Set the extracted data in the proposals state
            setLoading(false); // Update loading state
            
           
        })
        .catch((err) => {
            setProposal(null);
            setError(err); // Handle any errors
            setLoading(false); // Update loading state
        });
    }, []); // Empty dependency array ensures the effect runs once on component mount

    return { proposal, loading, error };
}

export default useSingleProposal;