"use client";
import Text from "@/components/text";
import styles from './proposalModal.module.scss';
import useSingleProposalData from "@/hooks/gov/useSingleProposalData";
import { formatProposalStatus } from "@/utils/gov/formatData";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";

export default function Page({ params }: any) {
  const {proposal} = useSingleProposalData(
    params.id,
    {chainId: 7700}
  )
  //console.log(proposal);
  if(!proposal){
    return (
      <div>Loading Proposal Data...</div>
    );
  }

  return (
  <div className={styles.proposalContainer}>
    <div className={styles.proposalHeaderContainer}>
        <div className={styles.proposalCard1}>
          <div style={{borderRight: "1px solid"}}><Text>#{proposal.proposal_id}</Text></div>
          <div><Text>{formatProposalStatus(proposal.status)}</Text></div>
        </div>
        <div>
            <Text font='proto_mono' size="x-lg">Proposal Title</Text>
        </div>
        <div>
          <Text opacity={0.4}>Description of proposal. Some random text. User connected a wallet and has a $CANTO in staking</Text>
        </div>
    </div>
    
    <div className={styles.proposalCardContainer}>
      <div className={styles.proposalCardContainer1}>
        <div className={styles.proposalInfoBox}>
          <div className={styles.proposalInfo}>
            <div><Text font="proto_mono">Type:</Text></div>
            <div><Text font="proto_mono">Software Updgrade</Text></div>
          </div>
          <div className={styles.proposalInfo}>
            <div><Text font="proto_mono">Proposer:</Text></div>
            <div><Text font="proto_mono">CANTO18190298...123</Text></div>
          </div>
          <div className={styles.proposalInfo}>
            <div><Text font="proto_mono">Total Deposit:</Text></div>
            <div>
              <Text font="proto_mono">1000 </Text>
            </div>
          </div>
        </div>
        <div className={styles.proposalInfoBox}>
            <div className={styles.proposalInfo}>
              <div><Text font="proto_mono">Submit Time:</Text></div>
              <div><Text font="proto_mono">{proposal.submit_time}</Text></div>
            </div>
            <div className={styles.proposalInfo}>
              <div><Text font="proto_mono">Voting End Time:</Text></div>
              <div><Text font="proto_mono">{proposal.voting_end_time}</Text></div>
            </div>
        </div>
        <div className={styles.proposalInfoBox}>
            <div className={styles.proposalInfo}>
              <div><Text font="proto_mono">Turnout/ Quorum: </Text></div>
              <div><Text font="proto_mono">38.1% 33.4%</Text></div>
            </div>
            <div className={styles.proposalInfo}>
              <div><Text font="proto_mono">Proposer: </Text></div>
              <div><Text font="proto_mono"> CANTO18190298...123</Text></div>
            </div>
        </div>
      </div>
      <div className={styles.proposalCardContainer2}>
        <div className={styles.proposalInfoBoxVoting}>
          <div className={styles.proposalInfoRow1}>
            <div className={styles.proposalInfoVoting}>
              <div><Text font="proto_mono">Yes</Text></div>
              <div><Text font="proto_mono">56%</Text></div>
              <div><Text font="proto_mono" opacity={0.4}>99496211</Text></div>
            </div>
            <div className={styles.proposalInfoVoting}>
              <div>
                <div><Text font="proto_mono">No</Text></div>
                <div><Text font="proto_mono">18%</Text></div>
              </div>
              
              <div><Text font="proto_mono" opacity={0.4}>99496211</Text></div>
            </div>
          </div>
          <div className={styles.proposalInfoRow1}>
            <div className={styles.proposalInfoVoting}>
              <div><Text font="proto_mono">Veto</Text></div>
              <div><Text font="proto_mono">25%</Text></div>
              <div><Text font="proto_mono" opacity={0.4}>99496211</Text></div>
            </div>
            <div className={styles.proposalInfoVoting}>
              <div><Text font="proto_mono">Abstain</Text></div>
              <div><Text font="proto_mono">1%</Text></div>
              <div><Text font="proto_mono" opacity={0.4}>99496211</Text></div>
            </div>
          </div>  
        </div>
        <div className={styles.VotingButton}>
          <Button width={300}>Vote</Button>
        </div>
      </div>
    </div>
  </div>
  );
  

  
  
}
