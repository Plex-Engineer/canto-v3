import styles from "./ProposalTable.module.scss";
import Container from "@/components/container/container";
import Text from "@/components/text";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import {
  formatProposalStatus,
  formatProposalType,
} from "@/utils/gov/formatData";
import { VoteGraphBox } from "../votingChart/voteGraph";
import { formatBalance } from "@/utils/formatting";
import Countdown from "@/components/timer/countdown";
import Icon from "@/components/icon/icon";

interface ProposalRowProps {
  proposal: Proposal;
  active: boolean;
  isMobile?: boolean;
}
export const ProposalRow = ({
  proposal,
  active,
  isMobile,
}: ProposalRowProps) => {
  const votes = active
    ? {
        yes: Number(
          formatBalance(proposal.final_vote.yes, 18, {
            precision: 2,
          })
        ),
        no: Number(
          formatBalance(proposal.final_vote.no, 18, {
            precision: 2,
          })
        ),
        veto: Number(
          formatBalance(proposal.final_vote.no_with_veto, 18, {
            precision: 2,
          })
        ),
        abstain: Number(
          formatBalance(proposal.final_vote.abstain, 18, {
            precision: 2,
          })
        ),
      }
    : null;

  return [
    <Container
      direction="column"
      width="100%"
      key={`name_${proposal.proposal_id}`}
      style={{
        cursor: "pointer",
        alignItems: "left",
        padding: isMobile ? "16px" : "",
        justifyContent: isMobile ? "space-between" : "unset",
      }}
      height={isMobile ? "100%" : ""}
    >
      <Container
        direction="row"
        style={{
          justifyContent: "flex-start",
          width: "100%",
          paddingLeft: !isMobile ? "10px" : "",
          marginBottom: isMobile ? "8px" : "12px",
          opacity: 0.4,
        }}
      >
        <Container
          style={{
            alignItems: "center",
            marginLeft: !isMobile ? "10px" : "",
            paddingRight: "16px",
            borderRight: "2px solid",
            justifyContent: "center",
          }}
        >
          <Text
            font="rm_mono"
            className={styles.tableData}
            size={isMobile ? "md" : "x-sm"}
          >
            {proposal.proposal_id}
          </Text>
        </Container>
        <Container
          style={{
            cursor: "pointer",
            alignItems: "center",
            marginLeft: "15px",
            justifyContent: "center",
          }}
        >
          <Text
            font="rm_mono"
            className={styles.tableData}
            size={isMobile ? "md" : "x-sm"}
          >
            {formatProposalType(proposal.type_url)}
          </Text>
        </Container>
      </Container>
      <Container
        style={{ cursor: "pointer", paddingLeft: isMobile ? "" : "20px" }}
        className={styles.tableTitleColumn}
      >
        <div className={styles.rowTitle}>
          <Text font="rm_mono" size={isMobile ? "md" : "sm"}>
            {proposal.title}
          </Text>
        </div>
      </Container>
      {isMobile && (
        <Container
          direction="row"
          style={{ justifyContent: "left", paddingTop: "16px" }}
        >
          {" "}
          <Container
            direction="column"
            style={{
              //marginBottom: "10px",
              justifyContent: "left",
              alignItems: "left",
              //marginLeft: "50px",
              //marginTop: "10px",
            }}
          >
            <Container
              direction="row"
              width="100%"
              style={{
                justifyContent: "flex-start",
                marginBottom: "10px",
              }}
            >
              <Text opacity={0.4} size="md" font="rm_mono">
                {active ? "Vote Status" : "Status"}
              </Text>
            </Container>
            {active ? (
              <Container direction="row">
                <Container>
                  {votes && (
                    <VoteGraphBox
                      yes={votes.yes}
                      no={votes.no}
                      veto={votes.veto}
                      abstain={votes.abstain}
                      size={40}
                    />
                  )}
                </Container>
              </Container>
            ) : (
              <Container direction="row" className={styles.proposalStatus}>
                <div className={styles.circleContainer}>
                  <div
                    className={styles.circle}
                    style={{
                      backgroundColor:
                        proposal.status == "PROPOSAL_STATUS_PASSED"
                          ? "#01BD09"
                          : "#EF4444",
                    }}
                  />
                </div>
                <Text font="rm_mono" className={styles.tableData} size="md">
                  {formatProposalStatus(proposal.status)}
                </Text>
              </Container>
            )}
          </Container>
          {active ? (
            <Container
              direction="column"
              height="100%"
              key={`votingTime_${proposal.proposal_id}`}
              style={{
                cursor: "pointer",
                alignItems: "left",
                justifyContent: "space-around",
              }}
            >
              <Container
                direction="column"
                //width="100%"
                style={{
                  //marginBottom: "10px",
                  marginLeft: "60px",
                  justifyContent: "left",
                  alignItems: "left",
                  //marginTop: "10px",
                }}
              >
                <Container
                  direction="row"
                  width="100%"
                  style={{
                    justifyContent: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <Text opacity={0.4} size="md" font="rm_mono">
                    Time left to Vote
                  </Text>
                </Container>

                <Container
                  direction="row"
                  className={styles.proposalVotingDate}
                  height="30px"
                >
                  <Text font="rm_mono" className={styles.tableData} size="lg">
                    <Countdown
                      endTimestamp={BigInt(
                        new Date(proposal.voting_end_time).getTime()
                      )}
                      timeFormat="h m s"
                    />
                  </Text>
                </Container>
              </Container>
            </Container>
          ) : (
            <Container
              key={`status_${proposal.proposal_id}`}
              direction="column"
              width="100%"
              style={{
                //marginBottom: "10px",
                marginLeft: "60px",
                justifyContent: "left",
                alignItems: "left",
                //marginTop: "10px",
              }}
            >
              <Container
                direction="row"
                width="100%"
                style={{
                  justifyContent: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <Text opacity={0.4} size="md" font="rm_mono">
                  Voting Date
                </Text>
              </Container>

              <Container direction="row" className={styles.proposalVotingDate}>
                <Text font="rm_mono" className={styles.tableData} size="lg">
                  {new Date(proposal.voting_end_time).toDateString()}
                </Text>
              </Container>
            </Container>
          )}
        </Container>
      )}
    </Container>,
    !isMobile && (
      <Container
        direction="column"
        height="100%"
        key={`status_${proposal.proposal_id}`}
        style={{
          cursor: "pointer",
          alignItems: "left",
          justifyContent: "center",
        }}
        width="100%"
      >
        <Container
          direction="column"
          style={{
            marginBottom: "10px",
            justifyContent: "left",
            alignItems: "left",
            marginLeft: "50px",
            marginTop: "10px",
          }}
        >
          <Container
            direction="row"
            width="100%"
            style={{
              justifyContent: "flex-start",
              marginBottom: "10px",
            }}
          >
            <Text opacity={0.4} size="x-sm" font="rm_mono">
              {active ? "Vote Status" : "Status"}
            </Text>
          </Container>
          {active ? (
            <Container direction="row">
              <Container>
                {votes && (
                  <VoteGraphBox
                    yes={votes.yes}
                    no={votes.no}
                    veto={votes.veto}
                    abstain={votes.abstain}
                    size={40}
                  />
                )}
              </Container>
            </Container>
          ) : (
            <Container direction="row" className={styles.proposalStatus}>
              <div className={styles.circleContainer}>
                <div
                  className={styles.circle}
                  style={{
                    backgroundColor:
                      proposal.status == "PROPOSAL_STATUS_PASSED"
                        ? "#01BD09"
                        : "#EF4444",
                  }}
                />
              </div>
              <Text font="rm_mono" className={styles.tableData} size="x-sm">
                {formatProposalStatus(proposal.status)}
              </Text>
            </Container>
          )}
        </Container>
      </Container>
    ),
    active
      ? !isMobile && (
          <Container
            direction="column"
            height="100%"
            key={`votingTime_${proposal.proposal_id}`}
            style={{
              cursor: "pointer",
              alignItems: "left",
              justifyContent: "space-around",
            }}
          >
            <Container
              direction="column"
              //width="100%"
              style={{
                marginBottom: "10px",
                marginLeft: "50px",
                justifyContent: "left",
                alignItems: "left",
                marginTop: "10px",
              }}
            >
              <Container
                direction="row"
                width="100%"
                style={{
                  justifyContent: "flex-start",
                  marginBottom: "10px",
                }}
              >
                <Text opacity={0.4} size="x-sm" font="rm_mono">
                  Time left to Vote
                </Text>
              </Container>

              <Container
                direction="row"
                className={styles.proposalVotingDate}
                height="30px"
              >
                <Text font="rm_mono" className={styles.tableData} size="sm">
                  <Countdown
                    endTimestamp={BigInt(
                      new Date(proposal.voting_end_time).getTime()
                    )}
                    timeFormat="h m s"
                  />
                </Text>
              </Container>
            </Container>
          </Container>
        )
      : !isMobile && (
          <Container
            key={`status_${proposal.proposal_id}`}
            direction="column"
            width="100%"
            style={{
              marginBottom: "10px",
              marginLeft: "50px",
              justifyContent: "left",
              alignItems: "left",
              marginTop: "10px",
            }}
          >
            <Container
              direction="row"
              width="100%"
              style={{
                justifyContent: "flex-start",
                marginBottom: "10px",
              }}
            >
              <Text opacity={0.4} size="x-sm" font="rm_mono">
                Voting Date
              </Text>
            </Container>

            <Container direction="row" className={styles.proposalVotingDate}>
              <Text font="rm_mono" className={styles.tableData} size="sm">
                {new Date(proposal.voting_end_time).toDateString()}
              </Text>
            </Container>
          </Container>
        ),
    !isMobile && (
      <Container
        key={`votingdate_${proposal.proposal_id}`}
        style={{
          cursor: "pointer",
          alignItems: "center",
        }}
      >
        <div className={styles.clickButton}>
          <Icon
            icon={{
              url: "/dropdown.svg",
              size: 22,
            }}
            themed
          />
        </div>
      </Container>
    ),
  ];
};
