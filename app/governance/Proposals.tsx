import Button from "@/components/button/button";
import Container from "@/components/container/container";
import { Proposal } from "@/hooks/governance/interfaces/proposalParams";
import { mapProposalStatus } from "@/utils/gov/proposalUtils";
import { useState } from "react";

interface ProposalsListParams{
    proposalsList: Proposal[],
    type: string
    
}


export const Proposals = (props:ProposalsListParams)=>{



    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredProposal, setHoveredProposal] = useState<Proposal | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const proposalsPerPage = 10; 
    const totalPages = Math.ceil(props.proposalsList.length / proposalsPerPage);

    const handleProposalClick =  async (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setIsModalOpen(true);
      };

    const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    if(props.proposalsList.length==0){
        return (
            <Container> No {props.type} Proposals Available</Container>
        )
    }

    return (
        <Container>
                <h4>Governance Proposals</h4>
                <div style={{
                                height: '10px'
                              }}>  </div>
                <div /*className="proposal-container"*/ >
                    <div>
                        {props.proposalsList.map((proposal,index) => (
                          
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
                                        {/* <h6>{proposal.title}</h6> */}
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
                  <Button onClick={nextPage} disabled={currentPage===totalPages}>Next</Button>
                </Container>
        </Container>
    );
}