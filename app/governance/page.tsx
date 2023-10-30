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

export default function GovernancePage() {
  const { proposals } = useProposals({ chainId: 7700 });

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
  const TableProps = {
    title: "Proposal Title",
    headers: ["ID", "Status"],
    columns: 2,
    data: [["1","Passed"],["2","Failed"]]
  }

  return (
    <div>
      <Tabs
        tabs={[
          {
            title: "ALL",
            content: (

              <Container>
                <Table title={TableProps.title} headers={TableProps.headers} columns={2} data={TableProps.data}></Table>
                {/* <ProposalTable proposals={proposals}></ProposalTable> */}
                <Proposals
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
                )}
              </Container>
            ),
            onClick: () => switchActiveTab("All"),
          },
          {
            title: "ACTIVE",
            content: (
              <Container>
                <Proposals
                  proposalsList={activeProposals}
                  type="Active"
                  onProposalClick={handleProposalClick}
                ></Proposals>
                {isModalOpen && selectedProposal && (
                  <ProposalModal
                    proposal={selectedProposal}
                    onClose={handleModalClose}
                    isOpen={isModalOpen}
                  ></ProposalModal>
                )}
              </Container>
            ),
            onClick: () => switchActiveTab("Active"),
          },
          {
            title: "REJECTED",
            content: (
              <Proposals
                proposalsList={rejectedProposals}
                type="Rejected"
                onProposalClick={handleProposalClick}
              ></Proposals>
            ),
            onClick: () => switchActiveTab("Rejected"),
          },
        ]}
      />
    </div>
  );
}
