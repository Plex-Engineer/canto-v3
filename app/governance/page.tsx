"use client";

import { useMemo, useState } from "react";

import Container from "@/components/container/container";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useProposals from "@/hooks/gov/useProposals";
import ProposalTable from "./components/ProposalTable/ProposalTable";
import Table from "@/components/table/table";
import styles from "./gov.module.scss";
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";
import { ethToCantoAddress } from "@/utils/address";
import { useRouter } from "next/navigation";

export default function GovernancePage() {
  //console.log(ethToCantoAddress("0xc514d047714C019b6AA7fbE181f87DD00C199B12"));

  const router = useRouter();

  const { txStore, signer, chainId } = useCantoSigner();
  const { proposals, isProposalsLoading } = useProposals({ chainId: chainId });

  const sorted_proposals = useMemo(
    () =>
      proposals.sort(
        (a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id
      ),
    [proposals]
  );

  //const proposalsPerPage = 10; // Number of proposals per page
  //const totalPages = Math.ceil(proposals?.length / proposalsPerPage);

  return isProposalsLoading ? (
    <Splash />
  ) : (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text font="proto_mono" className={styles.title}>
            Governance
          </Text>
          <Text size="sm" opacity={0.4} className={styles.middleText}>
            Stake your $CANTO to participate in governance
          </Text>
          <Button
            onClick={() => {
              router.push("/staking");
            }}
          >
            Go to Staking
          </Button>
        </div>

        <Spacer height="40px" />

        <ProposalTable proposals={sorted_proposals}></ProposalTable>
        <Spacer height="40px" />
      </div>
    </div>
  );
}
