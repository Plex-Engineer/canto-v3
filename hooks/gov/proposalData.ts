import { useState, useEffect } from 'react';

// Define your API endpoint for fetching governance proposals
const API_ENDPOINT = 'https://mainnode.plexnode.org:1317/cosmos/gov/v1beta1/proposals?pagination.limit=200';

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

function useGovernanceProposals(): UseGovernanceProposalsResult {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch the governance proposals from the API
    fetch(API_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        const extractedProposals: Proposal[] = data.proposals.map((proposalData: any) => {
        const votingEndTime = new Date(proposalData.voting_end_time);
        const now = new Date();
        const timeDifference = now.getTime() - votingEndTime.getTime();
        const daysSinceVotingEnd = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const final_tally_result = proposalData.final_tally_result;
        const votesYes = final_tally_result?.yes;
        const votesNo = final_tally_result?.no;
        const votesAbstain = final_tally_result?.abstain;
        const votesNo_with_veto = final_tally_result?.no_with_veto;
        console.log(final_tally_result);
          return {
            proposal_id: proposalData.proposal_id,
            title: proposalData.content.title,
            status: proposalData.status,
            voting_end_time: daysSinceVotingEnd,
            votes_yes : votesYes,
            votes_abstain : votesAbstain,
            votes_no : votesNo,
            votes_no_with_veto : votesNo_with_veto
          };
        });

        setProposals(extractedProposals); // Set the extracted data in the proposals state
        setLoading(false); // Update loading state
      })
      .catch((err) => {
        setError(err); // Handle any errors
        setLoading(false); // Update loading state
      });
  }, []); // Empty dependency array ensures the effect runs once on component mount

  return { proposals, loading, error };
}

export default useGovernanceProposals;
