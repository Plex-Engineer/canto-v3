"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./ProposalTable.module.scss";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import {
  formatProposalStatus,
  formatProposalType,
} from "@/utils/gov/formatData";
import Text from "@/components/text";
import Button from "@/components/button/button";
import { useRouter } from "next/navigation";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import Table from "@/components/table/table";
import Container from "@/components/container/container";
import { Pagination } from "@/components/pagination/Pagination";

interface TableProps {
  proposals: Proposal[];
}

const ProposalTable = ({ proposals }: TableProps) => {
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState<string>("All");
  // const [filteredProposals, setFilteredProposals] =
  //   useState<Proposal[]>(proposals);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(
  //   Math.ceil(filteredProposals.length / pageSize)
  // );

  const filteredProposals = useMemo(() => {
    if (currentFilter == "Active") {
      return proposals.filter(
        (proposal) => proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD"
      );
    }
    if (currentFilter == "Passed") {
      return proposals.filter(
        (proposal) => proposal.status === "PROPOSAL_STATUS_PASSED"
      );
    }
    if (currentFilter == "Rejected") {
      return proposals.filter(
        (proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED"
      );
    }
    return proposals;
  }, [currentFilter]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProposals.length / pageSize),
    [filteredProposals.length]
  );

  // useEffect(() => {
  //   setTotalPages(Math.ceil(filteredProposals.length / pageSize));
  // }, [filteredProposals.length, pageSize]);
  //console.log(proposals);
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageClick = (index: number) => {
    setCurrentPage(index);
  };
  const proposalTitleMap = new Map<string, string>();
  proposalTitleMap.set("All", "ALL PROPOSALS");
  proposalTitleMap.set("Active", "ACTIVE PROPOSALS");
  proposalTitleMap.set("Passed", "PASSED PROPOSALS");
  proposalTitleMap.set("Rejected", "REJECTED PROPOSALS");

  const handleRowClick = (proposalId: any) => {
    // Assuming you have access to the `useRouter` hook here
    //const router = useRouter();

    // Navigate to the appropriate page

    router.push(`/governance/proposal?id=${proposalId}`);
  };

  if (!proposals || proposals.length == 0) {
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
            title={proposalTitleMap.get(currentFilter)}
            secondary={
              <Container width="400px">
                <ToggleGroup
                  options={["All", "Active", "Passed", "Rejected"]}
                  selected={currentFilter}
                  setSelected={(value) => {
                    setCurrentFilter(value);
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
                          key={`row_${index}`}
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
                      numbersToDisplay={3}
                      handlePageClick={handlePageClick}
                    />,
                  ]
                : [
                    <div key="noData" className={styles.noProposalContainer}>
                      <Text font="proto_mono" size="lg">
                        NO {currentFilter} PROPOSALS FOUND
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
