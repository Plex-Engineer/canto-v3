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

interface TableProps {
  proposals: Proposal[];
}

const PAGE_SIZE = 10;
enum ProposalFilter {
  ALL = "ALL PROPOSALS",
  ACTIVE = "ACTIVE PROPOSALS",
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
        case ProposalFilter.ACTIVE:
          return proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD";
        case ProposalFilter.PASSED:
          return proposal.status === "PROPOSAL_STATUS_PASSED";
        case ProposalFilter.REJECTED:
          return proposal.status === "PROPOSAL_STATUS_REJECTED";
        default:
          return true;
      }
    });
  }, [currentFilter, proposals]);

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
            headers={
              filteredProposals.length != 0 || filteredProposals
                ? [
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          ID
                        </Text>
                      ),
                      ratio: 2,
                    },
                    { value: <Text opacity={0.4}>Title</Text>, ratio: 6 },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Status
                        </Text>
                      ),
                      ratio: 3,
                    },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Type
                        </Text>
                      ),
                      ratio: 5,
                    },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Voting Date
                        </Text>
                      ),
                      ratio: 4,
                    },
                  ]
                : []
            }
            content={
              paginatedProposals.length > 0
                ? [
                    ...paginatedProposals.map((proposal, index) => {
                      return (
                        <div
                          key={`row_${index}${proposal.proposal_id}`}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            cursor: "pointer",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "80px",
                          }}
                          onClick={() => handleRowClick(proposal.proposal_id)}
                        >
                          <Container
                            width="10%"
                            key={`name_${index}`}
                            style={{ cursor: "pointer", alignItems: "center" }}
                          >
                            <Text font="rm_mono" className={styles.tableData}>
                              {proposal.proposal_id}
                            </Text>
                          </Container>
                          <Container
                            width="30%"
                            key={`tokens_${index}`}
                            style={{ cursor: "pointer" }}
                            //direction="row"
                            className={styles.tableTitleColumn}

                            //gap="auto"
                          >
                            <Text
                              font="rm_mono"
                              size="sm"
                              className={styles.rowTitle}
                            >
                              {proposal.title}
                            </Text>
                          </Container>
                          <Container
                            width="15%"
                            key={`commission_${index}`}
                            style={{ cursor: "pointer", alignItems: "center" }}
                          >
                            <Text font="rm_mono" className={styles.tableData}>
                              {formatProposalStatus(proposal.status)}
                            </Text>
                          </Container>
                          <Container
                            width="25%"
                            key={`participation_${index}`}
                            style={{ cursor: "pointer", alignItems: "center" }}
                          >
                            <Text font="rm_mono" className={styles.tableData}>
                              {formatProposalType(proposal.type_url)}
                            </Text>
                          </Container>
                          <Container
                            width="20%"
                            key={`delegators_${index}`}
                            style={{ cursor: "pointer", alignItems: "center" }}
                          >
                            <Text font="rm_mono" className={styles.tableData}>
                              {new Date(
                                proposal.voting_end_time
                              ).toDateString()}
                            </Text>
                          </Container>
                        </div>
                      );
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
            isPaginated={true}
          />
        }
      </div>
    </div>
  );
};

export default ProposalTable;
