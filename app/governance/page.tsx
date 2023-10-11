"use client";

import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";
import {useGovernanceProposals} from "@/hooks/governance/proposalData";
import { SetStateAction, useEffect, useState } from "react";
import {useSingleProposal} from '@/hooks/governance/singleProposalData';
import Container from "@/components/container/container";
import { Proposal } from "@/hooks/governance/interfaces/proposalParams";
import { mapProposalStatus } from "@/utils/gov/proposalUtils";
import { ProposalModal } from "./proposalModal";
import { Proposals } from "./Proposals";




export default function GovernancePage() {
  
  const [activeTab, setActiveTab] = useState("All");
  const [statusIndex,setStatusIndex] = useState(0);

  function switchActiveTab(activeTab: string){
    setActiveTab(activeTab);
  }
  

  const {proposals,isLoading,error}  = useGovernanceProposals();

  const activeProposals = proposals?.filter((proposal:Proposal) => proposal.status === "PROPOSAL_STATUS_ACTIVE");
  const rejectedProposals = proposals?.filter((proposal:Proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED");
  //const [currentProposals, setCurrentProposals] = useState<Proposal[]>([]);
  //
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);

  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const proposalsPerPage = 10; // Number of proposals per page
  const totalPages = Math.ceil(proposals?.length / proposalsPerPage);

  const selectedProposalId = (selectedProposal? selectedProposal.proposal_id : "0");
  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);  
    setIsModalOpen(true);
  };
  console.log(selectedProposal);
  
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
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('Error:', error);
    return <div>Error while fetching Proposals</div>;
  }
  return <div>
    <Tabs
      tabs={[
        {
          title: "ALL",
          content: (
            <Container>
              <Proposals proposalsList={proposals} type="" onProposalClick={handleProposalClick}></Proposals>
              {isModalOpen && selectedProposal &&(
                <ProposalModal proposal={selectedProposal}  onClose={handleModalClose} isOpen={isModalOpen} ></ProposalModal>
              )}
        </Container>

          ),
        onClick: () => switchActiveTab("All"),
        },
        {
          title: "ACTIVE",
          content: (
            <Container>
              <Proposals proposalsList={activeProposals} type="Active" onProposalClick={handleProposalClick}></Proposals>
              {isModalOpen && selectedProposal && (
                <ProposalModal proposal={selectedProposal}  onClose={handleModalClose} isOpen={isModalOpen} ></ProposalModal>
              )}
            </Container>
          ),
          onClick: () => switchActiveTab("Active"),
        },
        {
          title: "REJECTED",
          content: (
            <Proposals proposalsList={rejectedProposals} type="Rejected" onProposalClick={handleProposalClick}></Proposals>
          ),
          onClick: () => switchActiveTab("Rejected"),
        }
      ]}
          />
  </div>;
}
