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
import useScreenSize from "@/hooks/helpers/useScreenSize";

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
  const { isMobile } = useScreenSize();
  return isProposalsLoading ? (
    <Splash themed />
  ) : (
    <div>
      <div className={styles.container}>
        <Container
          width="100%"
          className={styles.header}
          direction={isMobile ? "column" : "row"}
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <Text font="proto_mono" className={styles.title}>
              Governance
            </Text>
          </div>
          <Container
            direction="column"
            className={styles.middleText}
            center={{ vertical: true }}
            style={{ marginTop: isMobile ? "16px" : "" }}
          >
            <Text size="sm" color="#7B7B7B">
              Stake your $CANTO to participate in governance
            </Text>
          </Container>
        </Container>

        <Spacer height="32px" />

        <ProposalTable proposals={sorted_proposals} isMobile={isMobile} />
        <Spacer height="40px" />
      </div>
    </div>
  );
}
