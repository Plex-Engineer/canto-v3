import { NEW_ERROR, NO_ERROR, PromiseWithError, errMsg } from '@/config/interfaces';
import { tryFetch } from '@/utils/async.utils';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { castVoteTest, voteTxParams } from './transactions/vote';
import { getCosmosAPIEndpoint } from '@/utils/networks.utils';

const API_ENDPOINT = 'http://localhost:8000/v1/gov/proposals?pagination.limit=200';

export interface UseGovernanceProposalsResult {
  proposals: Proposal[];
  loading: boolean;
  error: Error | null;
}

const fetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

interface Proposal {
  proposal_id: string;
  //title: string;
  status: string;
  voting_end_time: string;
  votes_yes : string;
  votes_abstain : string;
  votes_no : string;
  votes_no_with_veto : string;
}


async function useGovernanceProposalsResult(): PromiseWithError<Proposal[]> {


  
  const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(7700);
  if (urlError) {
      return NEW_ERROR("getCosmosTokenBalance::" + errMsg(urlError));
  }
  const{data:result, error: proposalsFetchError} = await tryFetch<{proposals: any}>(nodeURL+"/cosmos/gov/v1beta1/proposals");

  if(proposalsFetchError){
    return NEW_ERROR("fetching proposals failed: "+errMsg(proposalsFetchError));
  }
  const proposalsList = result.proposals;
  const extractedProposalsList : Proposal[] = await proposalsList.map((proposalData: any)=>{
    const votingEndTime = new Date(proposalData.voting_end_time);
    const now = new Date();
    const timeDifference = now.getTime() - votingEndTime.getTime();
    const daysSinceVotingEnd = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    //const final_tally_result = proposalData.final_tally_result; - for the main-node rpc url, use this
    const final_tally_result = proposalData.final_vote; // for the canto-api url, use this
    const votesYes = final_tally_result?.yes;
    const votesNo = final_tally_result?.no;
    const votesAbstain = final_tally_result?.abstain;
    const votesNo_with_veto = final_tally_result?.no_with_veto;
      return {
        proposal_id: proposalData.proposal_id,
        //title: proposalData.content.title, - for the mainnode url, include this
        status: proposalData.status,
        voting_end_time: votingEndTime,
        votes_yes : votesYes,
        votes_abstain : votesAbstain,
        votes_no : votesNo,
        votes_no_with_veto : votesNo_with_veto
      };
  });
  
  
  return NO_ERROR(extractedProposalsList);

}

export function useGovernanceProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function getProposalsResult(){
    const {data: proposalsResult, error: proposalsError} = await useGovernanceProposalsResult();
    if(proposalsError){
      setError(proposalsError);
      setLoading(false);
    }
    if(proposalsResult){
      setProposals(proposalsResult);
      setLoading(false);
    }
  }
  useEffect(() => {
    getProposalsResult();
  }, []);
  
  return {proposals,isLoading,error};
}
//export default useGovernanceProposals;


  // useEffect(() => {
  //   // Fetch the governance proposals from the API

    
  //   fetch(API_ENDPOINT)
  //     .then((response) => response.json())
  //     .then((data) => {


  //       const proposalsList = JSON.parse(data.results);
        // const extractedProposals: Proposal[] = proposalsList.map((proposalData: any) => {
        // const votingEndTime = new Date(proposalData.voting_end_time);
        // const now = new Date();
        // const timeDifference = now.getTime() - votingEndTime.getTime();
        // const daysSinceVotingEnd = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        // //const final_tally_result = proposalData.final_tally_result; - for the main-node rpc url, use this
        // const final_tally_result = proposalData.final_vote; // for the canto-api url, use this
        // const votesYes = final_tally_result?.yes;
        // const votesNo = final_tally_result?.no;
        // const votesAbstain = final_tally_result?.abstain;
        // const votesNo_with_veto = final_tally_result?.no_with_veto;
        //   return {
        //     proposal_id: proposalData.proposal_id,
        //     //title: proposalData.content.title, - for the mainnode url, include this
        //     status: proposalData.status,
        //     voting_end_time: votingEndTime,
        //     votes_yes : votesYes,
        //     votes_abstain : votesAbstain,
        //     votes_no : votesNo,
        //     votes_no_with_veto : votesNo_with_veto
        //   };
        // });

  //       setProposals(extractedProposals); // Set the extracted data in the proposals state
  //       setLoading(false); // Update loading state
  //     })
  //     .catch((err) => {
  //       setError(err); // Handle any errors
  //       setLoading(false); // Update loading state
  //     });
  // }, []); // Empty dependency array ensures the effect runs once on component mount

  // return { proposals, loading, error };


  // const fetchProposals = async () => {
//   const {data:proposalsData,error: proposalError} = await tryFetch<any>(API_ENDPOINT);
//   if (proposalError) {
//     throw new Error('Failed to fetch data');
//   }
  

//   const extractedProposals = proposalsData.proposals.map((proposalData: any) => {
//       const votingEndTime = new Date(proposalData.voting_end_time);
//       const now = new Date();
//       const timeDifference = now.getTime() - votingEndTime.getTime();
//       const daysSinceVotingEnd = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
//       const final_tally_result = proposalData.final_tally_result;
//       const votesYes = final_tally_result?.yes;
//       const votesNo = final_tally_result?.no;
//       const votesAbstain = final_tally_result?.abstain;
//       const votesNo_with_veto = final_tally_result?.no_with_veto;

//       return {
//         proposal_id: proposalData.proposal_id,
//         title: proposalData.content.title,
//         status: proposalData.status,
//         voting_end_time: daysSinceVotingEnd,
//         votes_yes: votesYes,
//         votes_abstain: votesAbstain,
//         votes_no: votesNo,
//         votes_no_with_veto: votesNo_with_veto,
//       };
//   });

//   return extractedProposals;
// };


// async function useGovernanceProposals() {
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

  
//   useEffect(() => {
//     async function fetchData() {
//         const {data: extractedProposals,error,isLoading} = useQuery('proposals',fetchProposals);
//         if(!error){
//           setProposals(extractedProposals);
//           setLoading(false);
//         }
//         else{
//           setError(error);
//           setLoading(false);
//         }
        
//       }
//     }

//     fetchData();
//   }, []);

//   return { proposals, loading, error };
// }

