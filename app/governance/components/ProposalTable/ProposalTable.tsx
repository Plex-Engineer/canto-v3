"use client";
import React, { useEffect, useState } from "react";
import styles from "./ProposalTable.module.scss";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import {
  formatDate,
  formatProposalStatus,
  formatProposalType,
} from "@/utils/gov/formatData";
import Text from "@/components/text";
import Button from "@/components/button/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import Table from "@/components/table/table";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";

interface TableProps {
  proposals: Proposal[];
}

const ProposalTable = ({ proposals }: TableProps) => {
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState<string>("All");
  const [filteredProposals, setFilteredProposals] =
    useState<Proposal[]>(proposals);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(filteredProposals.length / pageSize)
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProposals.length / pageSize));
  }, [filteredProposals.length, pageSize]);
  //console.log(proposals);
  const paginatedProposals = filteredProposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  // console.log(paginatedProposals);
  useEffect(() => {
    handleFilterChange(currentFilter);
    setCurrentPage(1);
  }, [proposals, currentFilter]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    if (filter === "All") {
      setFilteredProposals(proposals);
    } else {
      if (filter === "Passed") {
        setFilteredProposals(
          proposals.filter(
            (proposal) => proposal.status === "PROPOSAL_STATUS_PASSED"
          )
        );
      }
      if (filter === "Rejected") {
        setFilteredProposals(
          proposals.filter(
            (proposal) => proposal.status === "PROPOSAL_STATUS_REJECTED"
          )
        );
      }
      if (filter === "Active") {
        setFilteredProposals(
          proposals.filter(
            (proposal) => proposal.status === "PROPOSAL_STATUS_VOTING_PERIOD"
          )
        );
      }
    }

    //setTotalPages(Math.ceil(filteredProposals.length / pageSize));
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
  //console.log(proposalTitleMap.get(currentFilter));

  if (!proposals || proposals.length == 0) {
    return (
      <div>
        <Text font="proto_mono">Loading Proposals...</Text>
      </div>
    );
  }
  return (
    <div className={styles.tableContainer}>
      {/* <div className={styles.toggleGroupContainer}>
        <div className={styles.toggleGroup}>
          <ToggleGroup options={["All","Active","Passed","Rejected"]} selected={currentFilter} setSelected={handleFilterChange}></ToggleGroup>
        </div>
          
      </div> */}
      {/* {(filteredProposals.length==0 || !filteredProposals) ? <div className={styles.table}><div className={styles.noProposalContainer}><Text font="proto_mono"> No {currentFilter} Proposals Available </Text></div></div> : 
      //   <table className={styles.table}>
      //   <thead>
      //     <tr key='proposalTableHeader'>
      //       <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>ID</Text></th>
      //       <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Title</Text></th>
      //       <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Status</Text></th>
      //       <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Type</Text></th>
      //       <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Voting Date</Text></th>
      //     </tr>
      //   </thead>
      //   <tbody>
      //     {paginatedProposals.map((proposal,index) => (
          
      //       <tr className={styles.row} key={proposal.proposal_id} onClick={()=>handleRowClick(proposal.proposal_id)}
      //       style={{ cursor: 'pointer' }}>
      //         <td className={styles.tableData}><Text font="rm_mono" size='sm'>{proposal.proposal_id}</Text></td>
      //         <td className={styles.tableTitleColumn}><Text font="rm_mono" size='sm' className={styles.rowTitle}>{proposal.title}</Text></td>
      //         <td className={styles.tableData}><Text font="rm_mono" size='sm'>{formatProposalStatus(proposal.status)}</Text></td>
      //         <td className={styles.tableData}><Text font="rm_mono" size='sm'>{formatProposalType(proposal.type_url)}</Text></td>
      //         <td className={styles.tableData}><Text font="rm_mono" size='sm'>{(new Date(proposal.voting_end_time)).toDateString()}</Text></td>
      //       </tr>
        
      //     ))}
          
      //   </tbody>
      // </table>     */}

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
                    { value: <Text opacity={0.4}>Title</Text>, ratio: 10 },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Status
                        </Text>
                      ),
                      ratio: 4,
                    },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Type
                        </Text>
                      ),
                      ratio: 7,
                    },
                    {
                      value: (
                        <Text opacity={0.4} font="rm_mono">
                          Voting Date
                        </Text>
                      ),
                      ratio: 7,
                    },
                  ]
                : []
            }
            content={paginatedProposals.map((proposal, index) => {
              return [
                <Container
                  key={`name_${index}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(proposal.proposal_id)}
                >
                  <Text font="rm_mono" className={styles.tableData}>
                    {proposal.proposal_id}
                  </Text>
                </Container>,
                <Container
                  key={`tokens_${index}`}
                  style={{ cursor: "pointer" }}
                  direction="row"
                  onClick={() => handleRowClick(proposal.proposal_id)}
                  className={styles.tableTitleColumn}
                  center={{ horizontal: true, vertical: true }}
                  gap="auto"
                >
                  <Text font="rm_mono" size="sm" className={styles.rowTitle}>
                    {proposal.title}
                  </Text>
                </Container>,
                <Container
                  key={`commission_${index}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(proposal.proposal_id)}
                >
                  <Text font="rm_mono" className={styles.tableData}>
                    {formatProposalStatus(proposal.status)}
                  </Text>
                </Container>,
                <Container
                  key={`participation_${index}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(proposal.proposal_id)}
                >
                  <Text font="rm_mono" className={styles.tableData}>
                    {formatProposalType(proposal.type_url)}
                  </Text>
                </Container>,
                <Container
                  key={`delegators_${index}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(proposal.proposal_id)}
                >
                  <Text font="rm_mono" className={styles.tableData}>
                    {new Date(proposal.voting_end_time).toDateString()}
                  </Text>
                </Container>,
              ];
            })}
          />
        }
      </div>
      <div className={styles.paginationContainer}>
        <div className={styles.paginationButton1}>
          <Button
            onClick={handlePrevious}
            disabled={currentPage == 1}
            width={100}
          >
            Previous
          </Button>
        </div>
        <div className={styles.paginationButton2}>
          <Button
            onClick={handleNext}
            disabled={currentPage == totalPages}
            width={100}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProposalTable;
