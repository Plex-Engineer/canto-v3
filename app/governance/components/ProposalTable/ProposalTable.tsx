"use client";
import React, { useMemo, useState } from "react";
import styles from "./ProposalTable.module.scss";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import {
  formatProposalStatus,
  formatProposalType,
} from "@/utils/gov/formatData";
import Text from "@/components/text";
import { useRouter } from "next/navigation";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import Table from "@/components/table/table";
import Container from "@/components/container/container";
import { Pagination } from "@/components/pagination/Pagination";
import Spacer from "@/components/layout/spacer";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting";
import { VoteGraphBox } from "../votingChart/voteGraph";
import ProposalVotingEndTime from "../VotingTime/ProposalVotingEndTime";
import { generatePaginatedProposalsTableRows } from "./GenerateTableRows";

interface TableProps {
  proposals: Proposal[];
}

const PAGE_SIZE = 10;
enum ProposalFilter {
  ALL = "ALL PROPOSALS",
  PASSED = "PASSED PROPOSALS",
  REJECTED = "REJECTED PROPOSALS",
}

const ProposalTable = ({ proposals }: TableProps) => {
  // route to proposal page
  const router = useRouter();
  const handleRowClick = (proposalId: any) => {
    // Navigate to the appropriate page
    router.push(`/governance/proposal?id=${proposalId}`);
  };

  // filter proposals
  const [currentFilter, setCurrentFilter] = useState<ProposalFilter>(
    ProposalFilter.ALL
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProposals = useMemo(() => {
    setCurrentPage(1);
    return proposals.filter((proposal) => {
      switch (currentFilter) {
        case ProposalFilter.PASSED:
          return proposal.status === "PROPOSAL_STATUS_PASSED";
        case ProposalFilter.REJECTED:
          return proposal.status === "PROPOSAL_STATUS_REJECTED";
        default:
          return (
            proposal.status === "PROPOSAL_STATUS_REJECTED" ||
            proposal.status === "PROPOSAL_STATUS_PASSED"
          );
      }
    });
  }, [currentFilter, proposals]);

  const activeProposals = useMemo(() => {
    setCurrentPage(1);
    return proposals.filter((proposal) => {
      return proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD";
    });
  }, [proposals]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProposals.length / PAGE_SIZE),
    [filteredProposals.length]
  );

  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (proposals.length == 0) {
    return (
      <div>
        <Text font="proto_mono">Loading Proposals...</Text>
      </div>
    );
  }
  return (
    <div className={styles.tableContainer}>
      {activeProposals.length > 0 ? (
        <div className={styles.table}>
          {
            <Table
              title="Active Proposals"
              // secondary={
              //   <Container width="400px">
              //     <ToggleGroup
              //       options={Object.values(ProposalFilter).map(
              //         (filter) => filter.split(" ")[0]
              //       )}
              //       selected={currentFilter.split(" ")[0]}
              //       setSelected={(value) => {
              //         const proposalFilter = Object.values(ProposalFilter).find(
              //           (filter) => filter.split(" ")[0] === value
              //         );
              //         setCurrentFilter(proposalFilter || ProposalFilter.ALL);
              //       }}
              //     />
              //   </Container>
              // }
              headerFont="proto_mono"
              headers={
                activeProposals.length != 0 || activeProposals
                  ? [
                      {
                        value: <div></div>,
                        ratio: 5,
                      },
                      {
                        value: <div></div>,
                        ratio: 2,
                      },

                      {
                        value: <div></div>,
                        ratio: 2,
                      },
                      {
                        value: <div></div>,
                        ratio: 1,
                      },
                    ]
                  : []
              }
              onRowsClick={
                activeProposals.length > 0
                  ? activeProposals.map(
                      (proposal) => () => handleRowClick(proposal.proposal_id)
                    )
                  : undefined
              }
              isGovTable={true}
              content={[
                ...activeProposals.map((proposal, index) => {
                  const yesVotes = Number(
                    formatBalance(proposal.final_vote.yes, 18, {
                      precision: 2,
                    })
                  );
                  const noVotes = Number(
                    formatBalance(proposal.final_vote.no, 18, {
                      precision: 2,
                    })
                  );
                  const vetoVotes = Number(
                    formatBalance(proposal.final_vote.no_with_veto, 18, {
                      precision: 2,
                    })
                  );
                  const abstainVotes = Number(
                    formatBalance(proposal.final_vote.abstain, 18, {
                      precision: 2,
                    })
                  );
                  return [
                    <Container
                      direction="column"
                      key={`name_${index}`}
                      style={{ cursor: "pointer", alignItems: "left" }}
                    >
                      <Container
                        direction="row"
                        style={{
                          justifyContent: "flex-start",
                          width: "100%",
                          paddingLeft: "10px",
                          marginBottom: "20px",
                          opacity: 0.4,
                          alignItems: "center",
                        }}
                      >
                        <Container
                          height="16px"
                          style={{
                            alignItems: "center",
                            marginLeft: "10px",
                            paddingRight: "15px",
                            borderRight: "2px solid",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            font="rm_mono"
                            className={styles.tableData}
                            size="x-sm"
                          >
                            {proposal.proposal_id}
                          </Text>
                        </Container>
                        <Container
                          height="16px"
                          key={`type_${index}`}
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
                            size="x-sm"
                          >
                            {formatProposalType(proposal.type_url)}
                          </Text>
                        </Container>
                      </Container>
                      <Container
                        key={`title_${index}`}
                        style={{ cursor: "pointer" }}
                        //direction="row"
                        className={styles.tableTitleColumn}

                        //gap="auto"
                      >
                        <div className={styles.rowTitle}>
                          <Text font="rm_mono" size="sm">
                            {proposal.title}
                          </Text>
                        </div>
                      </Container>
                    </Container>,

                    <Container
                      direction="column"
                      height="100%"
                      key={`status_${index}`}
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
                            Vote Status
                          </Text>
                        </Container>

                        <Container direction="row">
                          <Container>
                            <VoteGraphBox
                              yesVotes={yesVotes}
                              noVotes={noVotes}
                              vetoVotes={vetoVotes}
                              abstainVotes={abstainVotes}
                              size={40}
                            />
                          </Container>
                        </Container>
                      </Container>
                    </Container>,

                    <Container
                      direction="column"
                      height="100%"
                      key={`votingTime_${index}`}
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
                          <Text
                            font="rm_mono"
                            className={styles.tableData}
                            size="sm"
                          >
                            <ProposalVotingEndTime
                              endTime={new Date(proposal.voting_end_time)}
                            />
                          </Text>
                        </Container>
                      </Container>
                    </Container>,

                    <Container
                      key={`votingdate_${index}`}
                      style={{
                        cursor: "pointer",
                        alignItems: "center",
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
                    </Container>,
                  ];
                }),
              ]}
            />
          }
        </div>
      ) : (
        <div className={styles.noActiveProposalContainer}>
          <div className={styles.circleContainer}>
            <div
              className={styles.circle}
              style={{ height: "10px", width: "10px" }}
            />
          </div>
          <div style={{ paddingLeft: "20px" }}>
            <Text font="rm_mono">There are currently no active proposals</Text>
          </div>
        </div>
      )}
      <div>
        <Spacer height="30px" />
      </div>
      <div className={styles.table}>
        {
          <Table
            title={currentFilter}
            secondary={
              <Container width="400px">
                <ToggleGroup
                  options={Object.values(ProposalFilter).map(
                    (filter) => filter.split(" ")[0]
                  )}
                  selected={currentFilter.split(" ")[0]}
                  setSelected={(value) => {
                    const proposalFilter = Object.values(ProposalFilter).find(
                      (filter) => filter.split(" ")[0] === value
                    );
                    setCurrentFilter(proposalFilter || ProposalFilter.ALL);
                  }}
                />
              </Container>
            }
            headerFont="rm_mono"
            headers={
              filteredProposals.length != 0 || filteredProposals
                ? [
                    {
                      value: <div></div>,
                      ratio: 5,
                    },
                    {
                      value: <div></div>,
                      ratio: 2,
                    },

                    {
                      value: <div></div>,
                      ratio: 2,
                    },
                    {
                      value: <div></div>,
                      ratio: 1,
                    },
                  ]
                : []
            }
            onRowsClick={
              paginatedProposals.length > 0
                ? paginatedProposals.map(
                    (proposal) => () => handleRowClick(proposal.proposal_id)
                  )
                : undefined
            }
            isGovTable={true}
            content={
              paginatedProposals.length > 0
                ? [
                    ...paginatedProposals
                      .filter(
                        (proposal) =>
                          proposal.status != "PROPOSAL_STATUS_VOTING_PERIOD"
                      )
                      .map((proposal, index) => {
                        return [
                          <Container
                            direction="column"
                            width="100%"
                            key={`name_${index}`}
                            style={{ cursor: "pointer", alignItems: "left" }}
                          >
                            <Container
                              direction="row"
                              height="16px"
                              style={{
                                justifyContent: "flex-start",
                                width: "100%",
                                paddingLeft: "10px",
                                marginBottom: "20px",
                                opacity: 0.4,
                              }}
                            >
                              <Container
                                style={{
                                  alignItems: "center",
                                  marginLeft: "10px",
                                  paddingRight: "15px",
                                  borderRight: "2px solid",
                                  justifyContent: "center",
                                }}
                              >
                                <Text
                                  font="rm_mono"
                                  className={styles.tableData}
                                  size="x-sm"
                                >
                                  {proposal.proposal_id}
                                </Text>
                              </Container>
                              <Container
                                key={`type_${index}`}
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
                                  size="x-sm"
                                >
                                  {formatProposalType(proposal.type_url)}
                                </Text>
                              </Container>
                            </Container>
                            <Container
                              key={`title_${index}`}
                              style={{ cursor: "pointer" }}
                              //direction="row"
                              className={styles.tableTitleColumn}

                              //gap="auto"
                            >
                              <div className={styles.rowTitle}>
                                <Text font="rm_mono" size="sm">
                                  {proposal.title}
                                </Text>
                              </div>
                            </Container>
                          </Container>,

                          <Container
                            direction="column"
                            height="100%"
                            key={`status_${index}`}
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
                                  Status
                                </Text>
                              </Container>

                              <Container
                                direction="row"
                                className={styles.proposalStatus}
                              >
                                <div className={styles.circleContainer}>
                                  <div
                                    className={styles.circle}
                                    style={{
                                      backgroundColor:
                                        proposal.status ==
                                        "PROPOSAL_STATUS_PASSED"
                                          ? "#01BD09"
                                          : "#EF4444",
                                    }}
                                  />
                                </div>
                                <Text
                                  font="rm_mono"
                                  className={styles.tableData}
                                  size="x-sm"
                                >
                                  {formatProposalStatus(proposal.status)}
                                </Text>
                              </Container>
                            </Container>
                          </Container>,

                          <Container
                            key={`status_${index}`}
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
                                Voting Date
                              </Text>
                            </Container>

                            <Container
                              direction="row"
                              className={styles.proposalVotingDate}
                            >
                              <Text
                                font="rm_mono"
                                className={styles.tableData}
                                size="sm"
                              >
                                {new Date(
                                  proposal.voting_end_time
                                ).toDateString()}
                              </Text>
                            </Container>
                          </Container>,
                          <Container
                            key={`votingdate_${index}`}
                            style={{ cursor: "pointer", alignItems: "center" }}
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
                          </Container>,
                        ];
                      }),
                    <Pagination
                      key="pagination"
                      currentPage={currentPage}
                      totalPages={totalPages}
                      handlePageClick={(index) => setCurrentPage(index)}
                    />,
                  ]
                : [
                    <div key="noData" className={styles.noProposalContainer}>
                      <Text font="proto_mono" size="lg">
                        NO {currentFilter} FOUND
                      </Text>
                    </div>,
                  ]
            }
          />
        }
      </div>
    </div>
  );
};

export default ProposalTable;
