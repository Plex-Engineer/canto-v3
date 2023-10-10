"use client";



import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";
import useGovernanceProposals from "@/hooks/governance/proposalData";
import { SetStateAction, useEffect, useState } from "react";
import useSingleProposal from '@/hooks/governance/singleProposalData';
import Container from "@/components/container/container";
import Modal from "@/components/modal/modal";
import Button from "@/components/button/button";
import { useQuery } from "react-query";
import { useWalletClient } from "wagmi";
import useStore from "@/stores/useStore";
import useTransactionStore from "@/stores/transactionStore";
import { Proposal } from "@/hooks/governance/interfaces/proposalParams";
import { mapProposalStatus } from "@/utils/gov/proposalUtils";
import { ProposalModal } from "./proposalModal";
import { Proposals } from "./Proposals";
//import Proposal from './components/proposal';



export default function GovernancePage() {

  console.log("run");
  


  const [activeTab, setActiveTab] = useState("All");
  const [statusIndex,setStatusIndex] = useState(0);

  function switchActiveTab(activeTab: string){
    setActiveTab(activeTab);
  }
  

  const {proposals, error,loading}  = useGovernanceProposals();

  const activeProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_ACTIVE");
  const rejectedProposals = proposals.filter((proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED");
  const [currentProposals, setCurrentProposals] = useState<Proposal[]>([]);

  

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);

  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const proposalsPerPage = 10; // Number of proposals per page
  const totalPages = Math.ceil(proposals.length / proposalsPerPage);

  

  const fetchProposals = () => {
    const startIndex = (currentPage - 1) * proposalsPerPage;
    const endIndex = startIndex + proposalsPerPage;
    const proposalsToDisplay = proposals.slice(startIndex, endIndex); 
    setCurrentProposals(proposalsToDisplay);
  };

  useEffect(() => {
    console.log("useEffect is running");
    fetchProposals();
  }, [currentPage,proposals]);

  
  console.log("cur Proposals");
  console.log(currentProposals);



  

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


  


  
  
  if(proposals.length==0){
    return <div>NO PROPOSALS</div>
  }

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
              <Proposals proposalsList={proposals} type=""></Proposals>
              {isModalOpen && (
                <ProposalModal proposal={selectedProposal}  onClose={handleModalClose} isOpen={isModalOpen}></ProposalModal>
              )}
        </Container>

          ),
        onClick: () => switchActiveTab("All"),
        },
        {
          title: "ACTIVE",
          content: (
            <Container>
              <Proposals proposalsList={activeProposals} type="Active"></Proposals>
              {isModalOpen && (
                <ProposalModal proposal={selectedProposal}  onClose={handleModalClose} isOpen={isModalOpen}></ProposalModal>
              )}
            </Container>
          ),
          onClick: () => switchActiveTab("Active"),
        },
        {
          title: "REJECTED",
          content: (
            <Proposals proposalsList={rejectedProposals} type="Rejected"></Proposals>
          ),
          onClick: () => switchActiveTab("Rejected"),
        }
      ]}
          />
  </div>;
}
