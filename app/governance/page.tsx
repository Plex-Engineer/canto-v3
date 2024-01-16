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
import { useRouter } from "next/navigation";

export default function GovernancePage() {
  const router = useRouter();

  const { chainId } = useCantoSigner();
  const { proposals, isProposalsLoading } = useProposals({ chainId: chainId });

  const sorted_proposals = useMemo(
    () =>
      proposals.sort(
        (a: Proposal, b: Proposal) => b.proposal_id - a.proposal_id
      ),
    [proposals.length]
  );

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

        <ProposalTable proposals={sorted_proposals} />
        <Spacer height="40px" />
      </div>
    </div>
  );
}
