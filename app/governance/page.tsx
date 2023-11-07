"use client";
import Tabs from "@/components/tabs/tabs";
import { useState } from "react";

import Container from "@/components/container/container";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import { ProposalModal } from "./proposalModal";
import useProposals from "@/hooks/gov/useProposals";
import { Proposals } from "./Proposals";
import ProposalTable from "./components/ProposalTable/ProposalTable";
import Table from "@/components/table/table";
import styles from './gov.module.scss';
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import { convertToProposalType, proposalsData } from "./dummydata";
import Link from "next/link";

export default function GovernancePage() {
  //const { proposals } = useProposals({ chainId: 7700 });

  const proposals = proposalsData.map(convertToProposalType);
  

  
  const sorted_proposals = proposals.sort((a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id);


  const [activeTab, setActiveTab] = useState("All");

  function switchActiveTab(activeTab: string) {
    setActiveTab(activeTab);
  }

  const activeProposals = proposals?.filter(
    (proposal: Proposal) => proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD"
  );
  const rejectedProposals = proposals?.filter(
    (proposal: Proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED"
  );
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const proposalsPerPage = 10; // Number of proposals per page
  const totalPages = Math.ceil(proposals?.length / proposalsPerPage);

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  // let data = [];
  // for(var i=0;i<proposals.length;i++){
  //   data.push([proposals[i]['proposal_id'],'PROPOSAL_TITLE',proposals[i]['status'],proposals[i]['type_url'],proposals[i]['voting_end_time']]);
  // }
  // const TableProps = {
  //   title: "Governance",
  //   headers: ["ID","Title", "Status","Type","VotingDate"],
  //   columns: 5,
  //   data: data
  // }

  return (
    <div>
    <div className={styles.container}>
    <Text size="x-lg" font="proto_mono" className={styles.title}>
      Governance
    </Text>
    <Spacer height="20px" />
    <Link key={3} href={`/governance/${3}`}>
  </Link>
              
    <ProposalTable proposals={sorted_proposals}></ProposalTable>
              {/* <Table title={TableProps.title} headers={TableProps.headers} columns={5} data={TableProps.data}></Table> */}
              
              {/* <Proposals
                proposalsList={proposals}
                type=""
                onProposalClick={handleProposalClick}
              ></Proposals>
              {isModalOpen && selectedProposal && (
                <ProposalModal
                  proposal={selectedProposal}
                  onClose={handleModalClose}
                  isOpen={isModalOpen}
                ></ProposalModal>
              )} */}
    </div>
  </div>
  );
}
