import Button from "@/components/button/button";
import Container from "@/components/container/container";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import { useEffect, useState } from "react";

interface ProposalsListParams {
  proposalsList: Proposal[];
  type: string;
  onProposalClick: (proposal: Proposal) => void;
}
export const Proposals = (props: ProposalsListParams) => {
  const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);
  const [currentProposals, setCurrentProposals] = useState<Proposal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const proposalsPerPage = 10;
  const totalPages = Math.ceil(props.proposalsList.length / proposalsPerPage);

  const fetchProposals = (proposalsList: Proposal[]) => {
    const startIndex = (currentPage - 1) * proposalsPerPage;
    const endIndex = startIndex + proposalsPerPage;
    const proposalsToDisplay = proposalsList.slice(startIndex, endIndex);
    setCurrentProposals(proposalsToDisplay);
  };

  useEffect(() => {
    fetchProposals(props.proposalsList);
  }, [currentPage]);

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (props.proposalsList.length == 0) {
    return <Container> No {props.type} Proposals Available</Container>;
  }

  return (
    <Container>
      <h4>Governance Proposals</h4>
      <div
        style={{
          height: "10px",
        }}
      >
        {" "}
      </div>
      <div /*className="proposal-container"*/>
        <div>
          {currentProposals.map((proposal, index) => (
            <div
              key={proposal.proposal_id}
              onClick={() => props.onProposalClick(proposal)}
              onMouseEnter={() => setHoveredProposal(proposal)}
              onMouseLeave={() => setHoveredProposal(null)}
              style={{
                width: "400px",
                height: "100px",
              }}
            >
              {hoveredProposal === proposal ? (
                <>
                  <div>
                    <h6>YES: {proposal.final_vote.yes}</h6>
                  </div>
                  <div>
                    <h6>NO: {proposal.final_vote.no}</h6>
                  </div>
                  <div>
                    <h6>ABSTAIN: {proposal.final_vote.abstain}</h6>
                  </div>
                  <div>
                    <h6>VETO: {proposal.final_vote.no_with_veto}</h6>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div>Proposal ID: {proposal.proposal_id}</div>
                  </div>
                  <div>
                    <p>Status: {proposal.status}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <Container direction="row" gap={600}>
        <Button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </Container>
    </Container>
  );
};
