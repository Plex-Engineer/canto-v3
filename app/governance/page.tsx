"use client";

//import { Box, Container, Grid, Typography } from '@mui/material';
import {
  Box,
  Container,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@mui/material';


import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";
import useGovernanceProposals from "@/hooks/governance/proposalData";
import { SetStateAction, useEffect, useState } from "react";
import useSingleProposal from '@/hooks/governance/singleProposal';
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
  // Add other proposal properties as needed
}

export default function GovernancePage() {


  const [activeTab, setActiveTab] = useState("All");

  function switchActiveTab(activeTab: string){
    setActiveTab(activeTab);
  }

  const {proposals,loading, error}  = useGovernanceProposals();

  const activeProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_ACTIVE");
  const rejectedProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED");

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);
  //const [selectedProposalData, setSelectedProposalData] = useState<Proposal |null>(null);

  

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
      <Typography variant="h4" gutterBottom>
        Governance Proposals
      </Typography>
      <Grid container spacing={2}>
        {proposals.map((proposal) => (
          <Grid item xs={12} sm={6} key={proposal.proposal_id}>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 4,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                //background: 'linear-gradient(to bottom, #f7f7f7, #e4e4e4)',
                cursor: 'pointer',
              }}
              onClick={() => handleProposalClick(proposal)}
              onMouseEnter={() => setHoveredProposal(proposal)}
              onMouseLeave={() => setHoveredProposal(null)}
            >
              { (hoveredProposal === proposal)? 
              (
                <>
                <div>
                  <Typography variant="h6">
                    YES: {proposal.votes_yes}</Typography>
                  </div>
                  <div>
                  <Typography variant="h6">
                    NO: {proposal.votes_no}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" >
                    ABSTAIN: {proposal.votes_abstain}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" >
                    VETO: {proposal.votes_no_with_veto}
                  </Typography>
                </div>
                </>
              )
              :
              (
                <>
                    <div>
                      <Typography variant="h6">{proposal.title}</Typography>
                      </div>
                      <div>
                      <Typography variant="body2">
                        Proposal ID: {proposal.proposal_id}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body2" >
                        Status: {mapProposalStatus(proposal.status)}
                      </Typography>
                    </div>
                </>
               )
              }
            </Box>
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedProposal?.title}</DialogTitle>
        <DialogContent>
            {selectedProposal ? (
              <>
                <Typography variant="body2" color="textSecondary">
                  Proposal ID: {selectedProposal.proposal_id}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {mapProposalStatus(selectedProposal.status)}
                </Typography>
                {/* Render other proposal details here */}
                <Button variant="contained" color="primary" fullWidth
                  disabled={new Date() > new Date(selectedProposal.voting_end_time)} >
                  Vote
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No proposal selected.
              </Typography>
            )}
          </DialogContent>
      </Dialog>
    </Container>
                  // <div
                  //   //hook={bridgeIn}
                  //   // params={{
                  //   //   signer: signer,
                  //   //   transactionStore: transactionStore,
                  //   // }}
                  // >
                  //     <h1>Governance Proposals</h1>
                  //     <ul>
                  //       {proposals.map((proposal) => (
                  //         <li key={proposal.proposal_id}>
                  //           <h2>{proposal.title}</h2>
                  //           <p>Status: {proposal.status}</p>
                  //           <p>Days Since Voting Ended: {proposal.voting_end_time}</p>
                  //         </li>
                  //       ))}
                  //     </ul>
                  // </div>
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
