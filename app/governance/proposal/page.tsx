"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Text from "@/components/text";
import styles from "./proposalModal.module.scss";
//import useSingleProposalData from "@/hooks/gov/useSingleProposalData";
import {
  calculateVotePercentages,
  formatDeposit,
  formatProposalStatus,
  formatProposalType,
  formatTime,
} from "@/utils/gov/formatData";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";
import useProposals from "@/hooks/gov/useProposals";
import { useState } from "react";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Splash from "@/components/splash/splash";
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";
import Image from "next/image";
import { NEW_ERROR } from "@/config/interfaces";

import { formatBalance } from "@/utils/formatting/balances.utils";
import Container from "@/components/container/container";
import { RadioButton } from "../components/RadioButton/RadioButton";
import { VotingInfoBox } from "../components/VotingInfoBox/VotingInfoBox";
import { TransactionFlowType } from "@/transactions/flows/flowMap";
import { NewTransactionFlow } from "@/transactions/flows/types";
import { Height } from "@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb";
import Spacer from "@/components/layout/spacer";

export default function Page() {
  function castVote(proposalId: number, voteOption: VoteOption | null) {
    if (signer) {
      if (!voteOption) {
        return NEW_ERROR("Please select a vote option");
      }
      //console.log("cast vote test");
      const newFlow: NewTransactionFlow = {
        icon: "",
        txType: TransactionFlowType.VOTE_TX,
        title: "Vote Tx",
        params: {
          chainId: chainId,
          ethAccount: signer?.account.address ?? "",
          proposalId: proposalId,
          voteOption: voteOption,
        },
      };
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

  const { txStore, signer, chainId } = useCantoSigner();
  const { proposals, isLoading } = useProposals({ chainId: chainId });
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);

  const [isChecked, setChecked] = useState(false);

  const handleCheck = (voteOption: VoteOption) => {
    setSelectedVote(voteOption);
    setChecked(!isChecked);
  };

  //console.log(selectedVote);
  if (isLoading) {
    return <Splash />;
  }

  if (!id) {
    return (
      <div>
        <Text font="proto_mono">Proposal ID is missing</Text>
      </div>
    );
  }

  function getVotingBoxStyles() {
    if (isActive) {
      return {
        height: "70%",
        padding: "10px 0px 0px 0px",
      };
    }
    return {
      height: "100%",
      padding: "0px 0px 20px 0px",
    };
  }
  const proposal = proposals.find((p) => p.proposal_id === Number(proposalId));

  if (!proposal) {
    return (
      <div>
        <Text font="proto_mono">
          No proposal found with the ID {proposalId}{" "}
        </Text>
      </div>
    );
  }

  const isActive = formatProposalStatus(proposal.status) == "ACTIVE";

  const votesData = calculateVotePercentages(proposal.final_vote);

  //console.log(votesData);

  // const colorMap = new Map<number,String>();
  // colorMap.set(1, "rgba(6, 252, 153, 0.5)");
  // colorMap.set(2, "rgb(252, 81, 81,0.5)");
  // colorMap.set(3, "rgb(68, 85, 239,0.5)");
  // colorMap.set(4, "rgb(111, 105, 105,0.5)");
  const amounts = [
    parseFloat(votesData.Yes),
    parseFloat(votesData.No),
    parseFloat(votesData.Veto),
    parseFloat(votesData.Abstain),
  ];
  //console.log(Math.max(...amounts));

  const maxAmountIndex = amounts.indexOf(Math.max(...amounts));

  return isLoading ? (
    <Splash />
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
              <div>
                <Text font="proto_mono">
                  {formatDeposit(proposal.total_deposit[0].amount)}{" "}
                  <Image
                    src="/tokens/canto.svg"
                    width={16}
                    height={16}
                    alt="canto"
                    style={{
                      filter: "invert(var(--dark-mode))",
                    }}
                  />
                </Text>
              </div>
            </div>
            <div className={styles.proposalInfo}>
              <div>
                <Text font="proto_mono" opacity={0.3}>
                  Turnout/ Quorum:{" "}
                </Text>
              </div>
              <div>
                <Text font="proto_mono">38.1% 33.4%</Text>
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
            style={getVotingBoxStyles()}
          >
            <div className={styles.proposalInfoRow1}>
              <VotingInfoBox
                isActive={isActive}
                value={VoteOption.YES}
                selectedVote={selectedVote}
                votesData={votesData}
                isSelected={selectedVote == VoteOption.YES}
                color1="rgba(6, 252, 153,1)"
                color2="rgba(6, 252, 153, 0.5)"
                isHighest={maxAmountIndex == 0}
                onClick={() => setSelectedVote(VoteOption.YES)}
              ></VotingInfoBox>

              <VotingInfoBox
                isActive={isActive}
                value={VoteOption.NO}
                selectedVote={selectedVote}
                votesData={votesData}
                isSelected={selectedVote == VoteOption.NO}
                color1="rgb(252, 81, 81,1)"
                color2="rgb(252, 81, 81,0.5)"
                isHighest={maxAmountIndex == 1}
                onClick={() => setSelectedVote(VoteOption.NO)}
              ></VotingInfoBox>
            </div>

            <div className={styles.proposalInfoRow1}>
              <VotingInfoBox
                isActive={isActive}
                value={VoteOption.VETO}
                selectedVote={selectedVote}
                votesData={votesData}
                isSelected={selectedVote == VoteOption.VETO}
                color1="rgb(68, 85, 239,1)"
                color2="rgb(68, 85, 239,0.5)"
                isHighest={maxAmountIndex == 2}
                onClick={() => setSelectedVote(VoteOption.VETO)}
              ></VotingInfoBox>
              <VotingInfoBox
                isActive={isActive}
                value={VoteOption.ABSTAIN}
                selectedVote={selectedVote}
                votesData={votesData}
                isSelected={selectedVote == VoteOption.ABSTAIN}
                color1="rgb(111, 105, 105,1)"
                color2="rgb(111, 105, 105,0.5)"
                isHighest={maxAmountIndex == 3}
                onClick={() => setSelectedVote(VoteOption.ABSTAIN)}
              ></VotingInfoBox>
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
