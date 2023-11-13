"use client";
import React, { useEffect, useState } from 'react';
import styles from './ProposalTable.module.scss';
import { Proposal } from '@/hooks/gov/interfaces/proposal';
import { formatDate, formatProposalStatus, formatProposalType } from '@/utils/gov/formatData';
import Text from '@/components/text';
import Button from '@/components/button/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ToggleGroup from '../groupToggle/ToggleGroup';


interface TableProps {
  proposals: Proposal[];
}

const ProposalTable = ({ proposals }:TableProps) => {

  
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState('All');
  const [filteredProposals, setFilteredProposals] = React.useState<Proposal[]>(proposals);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(filteredProposals.length / pageSize));

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
  }, [proposals,currentFilter]);

  const handleFilterChange = (filter: string) => {
    
    setCurrentFilter(filter);
    if (filter === 'All') {
      setFilteredProposals(proposals);
    } else {
      if(filter==='Passed'){
        setFilteredProposals(proposals.filter(proposal => proposal.status === 'PROPOSAL_STATUS_PASSED'));
      }
      if(filter==='Rejected'){
        setFilteredProposals(proposals.filter(proposal => proposal.status === 'PROPOSAL_STATUS_REJECTED'));
      }
      if(filter==='Active'){
        setFilteredProposals(proposals.filter(proposal => proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD'));
      }
      
    }
    
    //setTotalPages(Math.ceil(filteredProposals.length / pageSize));
  };
  
  const handleRowClick = (proposalId:any) => {
    // Assuming you have access to the `useRouter` hook here
    //const router = useRouter();
  
    // Navigate to the appropriate page
    router.push(`/governance/proposal?id=${proposalId}`);
  };
  
  if (!proposals || proposals.length==0) {
    return <div>Loading Proposals...</div>;
  }
  return (
    <div className={styles.tableContainer}>
      <div className={styles.toggleGroupContainer}>
        <div className={styles.toggleGroup}>
          <ToggleGroup options={["All","Active","Passed","Rejected"]} selected={currentFilter} setSelected={handleFilterChange}></ToggleGroup>
        </div>
          
      </div>
      {/* <Filter onFilterChange={handleFilterChange} currentFilter={currentFilter} /> */}
      {(filteredProposals.length==0 || !filteredProposals) ? <div className={styles.table}><div className={styles.noProposalContainer}>No {currentFilter} Proposals Available</div></div> : 
        <table className={styles.table}>
        <thead>
          <tr key='proposalTableHeader'>
            <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>ID</Text></th>
            <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Title</Text></th>
            <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Status</Text></th>
            <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Type</Text></th>
            <th className={styles.tableHeader}><Text font='rm_mono' size='sm' weight='normal' opacity={0.4}>Voting Date</Text></th>
          </tr>
        </thead>
        <tbody>
          {paginatedProposals.map((proposal,index) => (
          
            <tr className={styles.row} key={proposal.proposal_id} onClick={()=>handleRowClick(proposal.proposal_id)}
            style={{ cursor: 'pointer' }}>
              <td className={styles.tableData}><Text font="proto_mono" size='sm'>{proposal.proposal_id}</Text></td>
              <td className={styles.tableTitleColumn}><Text font="proto_mono" size='sm' >{proposal.title}</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" size='sm'>{formatProposalStatus(proposal.status)}</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" size='sm'>{formatProposalType(proposal.type_url)}</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" size='sm'>{formatDate(proposal.voting_end_time)}</Text></td>
            </tr>
        
          ))}
          
        </tbody>
      </table>    
      }
      <div className={styles.paginationContainer}>
        <Button onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>

      {/* {proposals.map((proposal) => (
  <Link key={proposal.proposal_id} href={`/governance/${proposal.proposal_id}`}>
    <div className="proposal-link">Proposal {proposal.proposal_id} </div>
  </Link>
))} */}
      
    </div>
  );
};

export default ProposalTable;
