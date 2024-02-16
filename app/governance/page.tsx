"use client";

import { useMemo } from "react";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useProposals from "@/hooks/gov/useProposals";
import ProposalTable from "./components/ProposalTable/ProposalTable";
import styles from "./gov.module.scss";
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";
import Link from "next/link";
import Container from "@/components/container/container";

export default function GovernancePage() {
  const { chainId } = useCantoSigner();
  const { proposals, isProposalsLoading } = useProposals({ chainId: chainId });

  const sorted_proposals = useMemo(
    () =>
      proposals.sort(
        (a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [proposals.length]
  );

  return isProposalsLoading ? (
    <Splash themed />
  ) : (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text font="proto_mono" className={styles.title}>
            Governance
          </Text>
          <Container
            direction="column"
            className={styles.middleText}
            center={{ vertical: true }}
          >
            <Text size="sm" color="#7B7B7B">
              Stake your $CANTO to participate in governance
            </Text>
          </Container>
        </div>

        <Spacer height="40px" />

        <ProposalTable proposals={sorted_proposals} />
        <Spacer height="40px" />
      </div>
    </div>
  );
}
