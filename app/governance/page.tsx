"use client";

//import { Box, Container, Grid, Typography } from '@mui/material';


import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";
import useGovernanceProposals from "@/hooks/governance/proposalData";
import { SetStateAction, useEffect, useState } from "react";
import useSingleProposal from '@/hooks/governance/singleProposalData';
import Container from "@/components/container/container";
import Modal from "@/components/modal/modal";
import Button from "@/components/button/button";
//import Proposal from './components/proposal';

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

export default function GovernancePage() {


  const [activeTab, setActiveTab] = useState("All");
  const [statusIndex,setStatusIndex] = useState(0);

  function switchActiveTab(activeTab: string){
    setActiveTab(activeTab);
  }

  const {proposals,loading, error}  = useGovernanceProposals();

  const activeProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_ACTIVE");
  const rejectedProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED");
  const [currentProposals, setCurrentProposals] = useState<Proposal[]>([]);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);
  //const [selectedProposalData, setSelectedProposalData] = useState<Proposal |null>(null);

  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const proposalsPerPage = 10; // Number of proposals per page

  if(proposals.length!=0){

  }

  const fetchProposals = () => {
    // Simulate fetching proposals from your data source based on currentPage
    const startIndex = (currentPage - 1) * proposalsPerPage;
    const endIndex = startIndex + proposalsPerPage;
    const proposalsToDisplay = proposals.slice(startIndex, endIndex); // Replace 'yourData' with your actual data source
    setCurrentProposals(proposalsToDisplay);
  };

  useEffect(() => {
    fetchProposals();
  }, [currentPage]);



  

  // if(selectedProposal){
  //   const { selectedProposalData, pLoading, pError } = useSingleProposal(
  //     selectedProposal.proposal_id
  //   );
  // }
  const selectedProposalId = (selectedProposal? selectedProposal.proposal_id : "0");
  //const selectedProposals = useSingleProposal(selectedProposalId);
  const handleProposalClick =  async (proposal: Proposal) => {
    // const selectedProposal =  useSingleProposal(
    //   proposal.proposal_id
    // );
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };


  const mapProposalStatus = (status: Proposal['status'] | null) => {
    switch (status) {
      case 'PROPOSAL_STATUS_ACTIVE':
        return 'ACTIVE';
      case 'PROPOSAL_STATUS_REJECTED':
        return 'REJECTED';
      case 'PROPOSAL_STATUS_PASSED':
        return 'PASSED';
      default:
        return status;
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error:', error);
    return <div>Error</div>;
  }
  return <div>
    <Tabs
      tabs={[
        {
          title: "ALL",
          content: (
            <Container>
                <h4>Governance Proposals</h4>
                <div style={{
                                height: '10px'
                              }}>  </div>
                <div /*className="proposal-container"*/ >
                    <div>
                        {currentProposals.map((proposal,index) => (
                          
                            <div key={proposal.proposal_id}
                              
                              onClick={() => handleProposalClick(proposal)}
                              onMouseEnter={() => setHoveredProposal(proposal)}
                              onMouseLeave={() => setHoveredProposal(null)}
                              style={{
                                width: '400px', 
                                height: '100px'
                              }}
                              
                            >
                                { (hoveredProposal === proposal)? 
                                (
                                  <>
                                  <div>
                                    <h6>
                                      YES: {proposal.votes_yes}
                                    </h6>
                                  </div>
                                  <div>
                                    <h6>
                                      NO: {proposal.votes_no}
                                    </h6>
                                  </div>
                                  <div>
                                    <h6>
                                      ABSTAIN: {proposal.votes_abstain}
                                    </h6>
                                  </div>
                                  <div>
                                    <h6>
                                      VETO: {proposal.votes_no_with_veto}
                                    </h6>
                                  </div>
                                  </>
                                )
                                :
                                (
                                  <>
                                      <div>
                                        <h6>{proposal.title}</h6>
                                        </div>
                                        <div>
                                        <div>
                                          Proposal ID: {proposal.proposal_id}
                                        </div>
                                      </div>
                                      <div>
                                        <p >
                                          Status: {mapProposalStatus(proposal.status)}
                                        </p>
                                      </div>
                                  </>
                                )
                                }

                            </div>
                        ))}
                    </div>
                </div>
                <Container direction="row" gap = {600}>
                  <Button onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <Button onClick={nextPage}>Next</Button>
                </Container>
                {isModalOpen && (
                  <Modal onClose={handleModalClose} open={isModalOpen}>
                    {selectedProposal && (
                      <>
                        <h2>{selectedProposal.title}</h2>
                        <div>
                          <p>Proposal ID: {selectedProposal.proposal_id}</p>
                        </div>
                        <div>
                          <p>Status: {mapProposalStatus(selectedProposal.status)}</p>
                        </div>
                        <Button
                          color="primary"
                          disabled={new Date() > new Date(selectedProposal.voting_end_time)}
                        >
                          Vote
                        </Button>
                      </>
                    )}
                  </Modal>
                )}
          </Container>
          ),
        onClick: () => switchActiveTab("All"),
        },
        {
          title: "ACTIVE",
          content: (
            <div
              // hook={bridgeOut}
              // params={{
              //   signer: signer,
              //   transactionStore: transactionStore,
              // }}
            >
              {activeProposals.length==0?<div>No active proposals available.</div> : 
              <div>
                <h1>Governance Proposals (Active)</h1>
                <ul>
                  {activeProposals.map((proposal) => (
                    <li key={proposal.proposal_id}>
                      <h2>{proposal.title}</h2>
                      <p>Status: {proposal.status}</p>
                      <p>Days Since Voting Ended: {proposal.voting_end_time}</p>
                    </li>
                  ))}
                </ul>
              </div> }
            </div>
          ),
          onClick: () => switchActiveTab("Active"),
        },
        {
          title: "REJECTED",
          content: (
            <div
              // hook={bridgeOut}
              // params={{
              //   signer: signer,
              //   transactionStore: transactionStore,
              // }}
            >
              {rejectedProposals.length==0?<div>No active proposals available.</div> : 
              <div>
                <h1>Governance Proposals (Active)</h1>
                <ul>
                  {rejectedProposals.map((proposal) => (
                    <li key={proposal.proposal_id}>
                      <h2>{proposal.title}</h2>
                      <p>Status: {proposal.status}</p>
                      <p>Days Since Voting Ended: {proposal.voting_end_time}</p>
                    </li>
                  ))}
                </ul>
              </div> }
            </div>
          ),
          onClick: () => switchActiveTab("Rejected"),
        }
      ]}
          />
  </div>;
}
