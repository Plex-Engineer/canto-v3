"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Text from "@/components/text";
import styles from "./proposalModal.module.scss";
import {
  calculateVotePercentages,
  formatProposalStatus,
  formatProposalType,
  formatTime,
} from "@/utils/gov/formatData";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";
import useProposals from "@/hooks/gov/useProposals";
import { useState } from "react";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";
import { VoteOption } from "@/transactions/gov";
import Image from "next/image";
import { NEW_ERROR } from "@/config/interfaces";
import { VotingInfoBox } from "../components/VotingInfoBox/VotingInfoBox";
import { displayAmount } from "@/utils/formatting";
import {
  PROPOSAL_QUORUM_VALUE,
  PROPOSAL_TURNOUT_VALUE,
} from "@/config/consts/config";

const VOTE_OPTION_COLORS = {
  [VoteOption.YES]: "rgb(6, 252, 153)",
  [VoteOption.NO]: "rgb(252, 81, 81)",
  [VoteOption.VETO]: "rgb(68, 85, 239)",
  [VoteOption.ABSTAIN]: "rgb(111, 105, 105)",
};

export default function Page() {
  // signer information
  const { txStore, signer, chainId } = useCantoSigner();
  // get proposals
  const { proposals, isProposalsLoading, newVoteFlow } = useProposals({
    chainId: chainId,
  });
  // transaction
  function castVote(proposalId: number, voteOption: VoteOption | null) {
    if (signer) {
      if (!voteOption) {
        return NEW_ERROR("Please select a vote option");
      }
      const newFlow = newVoteFlow({
        chainId: chainId,
        ethAccount: signer.account.address,
        proposalId: proposalId,
        voteOption: voteOption,
      });
      txStore?.addNewFlow({
        txFlow: newFlow,
        ethAccount: signer.account.address,
      });
    }
  }

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const proposalId = Number(id);
  const router = useRouter();

  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);

  if (isProposalsLoading) {
    return <Splash themed />;
  }

  if (!id) {
    return (
      <div className={styles.noProposalContainer}>
        <Text font="proto_mono">Proposal ID is missing</Text>
      </div>
    );
  }

  const proposal = proposals.find((p) => p.proposal_id === Number(proposalId));

  if (!proposal) {
    return (
      <div className={styles.noProposalContainer}>
        <Text font="proto_mono">
          No proposal found with the ID {proposalId}{" "}
        </Text>
      </div>
    );
  }

  const isActive = formatProposalStatus(proposal.status) == "ACTIVE";

  const votesData = calculateVotePercentages(proposal.final_vote);

  const maxAmountIndex = [
    parseFloat(votesData[VoteOption.YES].percentage),
    parseFloat(votesData[VoteOption.NO].percentage),
    parseFloat(votesData[VoteOption.VETO].percentage),
    parseFloat(votesData[VoteOption.ABSTAIN].percentage),
  ].indexOf(
    Math.max(
      ...[
        parseFloat(votesData[VoteOption.YES].percentage),
        parseFloat(votesData[VoteOption.NO].percentage),
        parseFloat(votesData[VoteOption.VETO].percentage),
        parseFloat(votesData[VoteOption.ABSTAIN].percentage),
      ]
    )
  );

  const VoteBox = ({ option, idx }: { option: VoteOption; idx: number }) => (
    <VotingInfoBox
      key={option}
      isActive={isActive}
      percentage={votesData[option].percentage}
      amount={votesData[option].amount}
      value={option}
      isSelected={selectedVote == option}
      color={VOTE_OPTION_COLORS[option]}
      isHighest={maxAmountIndex == idx}
      onClick={() => setSelectedVote(option)}
    />
  );

  return isProposalsLoading ? (
    <Splash themed />
  ) : (
    <div className={styles.proposalContainer}>
      <div className={styles.proposalHeaderContainer}>
        <div className={styles.proposalCard1}>
          <div
            className={styles.backButtonContainer}
            onClick={() => {
              router.push("/governance");
            }}
          >
            <div className={styles.backButton}>
              <Icon
                icon={{
                  url: "/dropdown.svg",
                  size: 22,
                }}
                themed
              />
            </div>
          </div>
          <div style={{ borderRight: "1px solid", padding: "10px" }}>
            <Text>#{proposal.proposal_id}</Text>
          </div>
          <div style={{ padding: "10px" }}>
            <Text>{formatProposalStatus(proposal.status)}</Text>
          </div>
        </div>
        <div style={{ padding: "10px 0px 10px 0px" }}>
          <Text font="proto_mono" size="x-lg">
            {proposal.title}
          </Text>
        </div>

        <div>
          <Text opacity={0.4}>{proposal.description}</Text>
        </div>
      </div>

      <div className={styles.proposalCardContainer}>
        <div className={styles.proposalCardContainer1}>
          <div className={styles.proposalInfoBox}>
            <div className={styles.proposalInfo}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Type:
                </Text>
              </div>
              <div>
                <Text font="proto_mono">
                  {formatProposalType(proposal.type_url)}
                </Text>
              </div>
            </div>
            <div className={styles.proposalInfo}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Total Deposit:
                </Text>
              </div>
              <div className={styles.displayAmount}>
                <Text font="proto_mono">
                  {displayAmount(proposal.total_deposit[0].amount, 18, {
                    commify: true,
                    short: false,
                  })}{" "}
                </Text>
                <div className={styles.displayAmount}>
                  <div>&nbsp;</div>
                  <Image
                    src="/tokens/canto.svg"
                    width={16}
                    height={16}
                    alt="canto"
                    style={{
                      filter: "invert(var(--dark-mode))",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={styles.proposalInfo}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Turnout / Quorum:{" "}
                </Text>
              </div>
              <div>
                <Text font="proto_mono">
                  {PROPOSAL_TURNOUT_VALUE} &nbsp; {PROPOSAL_QUORUM_VALUE}
                </Text>
              </div>
            </div>
          </div>
          <div className={styles.proposalInfoBox2}>
            <div className={styles.proposalInfo2}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Submit Time:
                </Text>
              </div>
              <div>
                <Text font="proto_mono">
                  {formatTime(proposal.submit_time)}
                </Text>
              </div>
            </div>
            <div className={styles.proposalInfo2}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Voting End Time:
                </Text>
              </div>
              <div>
                <Text font="proto_mono">
                  {formatTime(proposal.voting_end_time)}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.proposalCardContainer2}>
          <div
            className={styles.proposalInfoBoxVoting}
            style={
              isActive
                ? {
                    height: "70%",
                    padding: "10px 0px 0px 0px",
                  }
                : {
                    height: "100%",
                    padding: "0px 0px 20px 0px",
                  }
            }
          >
            <div className={styles.proposalInfoRow1}>
              <VoteBox option={VoteOption.YES} idx={0} />
              <VoteBox option={VoteOption.NO} idx={1} />
            </div>

            <div className={styles.proposalInfoRow1}>
              <VoteBox option={VoteOption.VETO} idx={2} />
              <VoteBox option={VoteOption.ABSTAIN} idx={3} />
            </div>
          </div>
          {isActive && (
            <div className={styles.VotingButton}>
              <Button
                width={400}
                disabled={!isActive}
                onClick={() => castVote(proposal.proposal_id, selectedVote)}
              >
                Vote
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
