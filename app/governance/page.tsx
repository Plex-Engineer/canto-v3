"use client";

import { useState } from "react";

import Container from "@/components/container/container";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useProposals from "@/hooks/gov/useProposals";
import ProposalTable from "./components/ProposalTable/ProposalTable";
import Table from "@/components/table/table";
import styles from './gov.module.scss';
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";


export default function GovernancePage() {

  const { txStore, signer,chainId } = useCantoSigner();
  const { proposals,isLoading } = useProposals({ chainId: chainId });

  const sorted_proposals = proposals.sort((a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id);
  


  const proposalsPerPage = 10; // Number of proposals per page
  const totalPages = Math.ceil(proposals?.length / proposalsPerPage);

  return (isLoading ? (<Splash/>): 
    (<div>
    <div className={styles.container}>
    <div className={styles.header}>
      <Text font="proto_mono" className={styles.title}>
        Governance  
      </Text>
      <Text size='sm' opacity={0.4} className={styles.middleText}>Stake your $CANTO to participate in governance</Text>
      <Button >Go to Staking</Button>
    </div>
    
    <Spacer height="20px" />
    
              
    <ProposalTable proposals={sorted_proposals}></ProposalTable>
    <Spacer height="40px" />
    </div>
  </div>)
  );
}