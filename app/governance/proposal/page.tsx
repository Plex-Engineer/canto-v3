"use client";
import { useSearchParams } from "next/navigation";
import Text from "@/components/text";
import styles from './proposalModal.module.scss';
import useSingleProposalData from "@/hooks/gov/useSingleProposalData";
import { calculateVotePercentages, formatDeposit, formatProposalStatus, formatProposalType, formatTime } from "@/utils/gov/formatData";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";
import useProposals from "@/hooks/gov/useProposals";
import { useState } from "react";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import { ProposalModal } from "../components/VotingModal/VotingModal";



export default function Page() {
  const searchParams = useSearchParams();

  const id = searchParams.get('id');
  console.log(id);
  const proposalId = Number(id);

  
  const {proposals} = useProposals(
    {chainId: 7700}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if(!proposals || proposals.length==0){
    return (
      <div>Loading Proposals....</div>
    );
  }
  if(!id){
    return (
        <div>Proposal ID is missing</div>
    )
  }
  const proposal = proposals.find((p) => p.proposal_id === Number(proposalId));

  if (!proposal) {
    return <div>No proposal found with the ID {proposalId}</div>;
  }
  //console.log(proposal);
  const isActive = formatProposalStatus(proposal.status)=='ACTIVE';

  const votesData = calculateVotePercentages(proposal.final_vote);
  const handleProposalClick = (proposal: Proposal) => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
  <div className={styles.proposalContainer}>
    <div className={styles.proposalHeaderContainer}>
        <div className={styles.proposalCard1}>
          <div style={{borderRight: "1px solid", padding: "10px"}}><Text>#{proposal.proposal_id}</Text></div>
          <div style={{padding: "10px"}}><Text>{formatProposalStatus(proposal.status)}</Text></div>
        </div>
        <div style={{padding: "10px 0px 10px 0px"}}>
            <Text font='proto_mono' size="x-lg">{proposal.title}</Text>
        </div>
        <div>
          <Text opacity={0.4}>{proposal.description}</Text>
        </div>
    </div>
    
    <div className={styles.proposalCardContainer}>
      <div className={styles.proposalCardContainer1}>
        <div className={styles.proposalInfoBox}>
          <div className={styles.proposalInfo}>
            <div><Text font="proto_mono" opacity={0.3}>Type:</Text></div>
            <div><Text font="proto_mono">{formatProposalType(proposal.type_url)}</Text></div>
          </div>
          <div className={styles.proposalInfo}>
            <div><Text font="proto_mono" opacity={0.3}>Total Deposit:</Text></div>
            <div>
              <Text font="proto_mono">{formatDeposit(proposal.total_deposit[0].amount)} </Text>
            </div>
          </div>
          <div className={styles.proposalInfo}>
              <div><Text font="proto_mono" opacity={0.3}>Turnout/ Quorum: </Text></div>
              <div><Text font="proto_mono">38.1% 33.4%</Text></div>
            </div>
        </div>
        <div className={styles.proposalInfoBox2}>
            <div className={styles.proposalInfo2}>
              <div><Text font="proto_mono" opacity={0.3}>Submit Time:</Text></div>
              <div><Text font="proto_mono">{formatTime(proposal.submit_time)}</Text></div>
            </div>
            <div className={styles.proposalInfo2}>
              <div><Text font="proto_mono" opacity={0.3}>Voting End Time:</Text></div>
              <div><Text font="proto_mono">{formatTime(proposal.voting_end_time)}</Text></div>
            </div>
        </div>
        
      </div>
      <div className={styles.proposalCardContainer2}>
        <div className={styles.proposalInfoBoxVoting}>
          <div className={styles.proposalInfoRow1}>
            <div className={styles.proposalInfoVoting}>
              <div className={styles.votingInfoRow1}>
                
                <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div className={styles.circle} style={{ backgroundColor: "green", margin:"10px 5px 0px 10px" }}></div> <div><Text font="proto_mono">Yes</Text></div></div>
                <div><Text font="proto_mono">{votesData.yes}%</Text></div>
              </div>
              <div className={styles.votingInfoRow2}>
                <div><Text font="proto_mono" opacity={0.4} size="x-sm">{votesData.yesAmount}</Text></div>
              </div>
              
              
            </div>
            <div className={styles.proposalInfoVoting}>
              <div className={styles.votingInfoRow1}>
                <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div className={styles.circle} style={{ backgroundColor: "red", margin:"10px 5px 0px 10px" }}></div> <div><Text font="proto_mono">No</Text></div></div>
                <div><Text font="proto_mono">{votesData.no}%</Text></div>
              </div>
              <div className={styles.votingInfoRow2}>
                <div><Text font="proto_mono" opacity={0.4} size="x-sm">{votesData.noAmount}</Text></div>
              </div>

            </div>
          </div>
          <div className={styles.proposalInfoRow1}>
            <div className={styles.proposalInfoVoting}>
              <div className={styles.votingInfoRow1}>
                <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div className={styles.circle} style={{ backgroundColor: "#4455EF", margin:"10px 5px 0px 10px" }}></div> <div><Text font="proto_mono">Veto</Text></div></div>
                <div><Text font="proto_mono">{votesData.no_with_veto}%</Text></div>
              </div>
              <div className={styles.votingInfoRow2}>
                <div><Text font="proto_mono" opacity={0.4} size="x-sm">{votesData.no_with_vetoAmount}</Text></div>
              </div>
              
              
            </div>
            <div className={styles.proposalInfoVoting}>
              <div className={styles.votingInfoRow1}>
                <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div className={styles.circle} style={{ backgroundColor: "black" , margin:"10px 5px 0px 10px"}}></div> <div><Text font="proto_mono">Abstain</Text></div></div>
                <div><Text font="proto_mono">{votesData.abstain}%</Text></div>
              </div>
              <div className={styles.votingInfoRow2}>
                <div><Text font="proto_mono" opacity={0.4} size="x-sm">{votesData.abstainAmount}</Text></div>
              </div>
            </div>
          </div>  
        </div>
        <div className={styles.VotingButton}>
          <Button width={300} disabled={!isActive} onClick={()=>handleProposalClick(proposal)}>Vote</Button>
          {/* {!isActive && <span className={styles.tooltip}>The Proposal is not Active</span>} */}
        </div>
      </div>
    </div>
    {isModalOpen && (
      <ProposalModal proposal={proposal} onClose={ ()=> {
        handleModalClose();
       } } isOpen={true}></ProposalModal>
      )}
  </div>
  );
  

  
  
}
