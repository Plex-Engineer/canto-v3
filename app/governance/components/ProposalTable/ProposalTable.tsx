import React, { useEffect, useState } from 'react';
import Filter from '../Filter/Filter';
import styles from './ProposalTable.module.scss';
import { Proposal } from '@/hooks/gov/interfaces/proposal';
import { formatDate, formatProposalStatus, formatProposalType } from '@/utils/gov/formatData';
import Text from '@/components/text';
import Button from '@/components/button/button';


interface TableProps {
  proposals: Proposal[];
}

const ProposalTable: React.FC<TableProps> = ({ proposals }) => {

  
  
  const [currentFilter, setCurrentFilter] = useState('All');
  const [filteredProposals, setFilteredProposals] = React.useState<Proposal[]>(proposals);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(filteredProposals.length / pageSize));

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProposals.length / pageSize));
  }, [filteredProposals.length, pageSize]);
  console.log(totalPages);
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
  
  if (!proposals || proposals.length==0) {
    return <div>Loading Proposals...</div>;
  }
  return (
    <div className={styles.tableContainer}>
      <Filter onFilterChange={handleFilterChange} currentFilter={currentFilter} />
      {(filteredProposals.length==0 || !filteredProposals) ? <div className={styles.table}><div className={styles.noProposalContainer}><div className={styles.emptyProposals}>No Proposals available</div></div></div> : 
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
            <tr className={styles.row} key={proposal.proposal_id}>
              {/* <div>PROPOSALS</div> */}
              <td className={styles.tableData}><Text font="proto_mono" >{proposal.proposal_id}</Text></td>
              <td className={styles.tableTitleColumn}><Text font="proto_mono" >PROPOSAL TITLE</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" >{formatProposalStatus(proposal.status)}</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" >{formatProposalType(proposal.type_url)}</Text></td>
              <td className={styles.tableData}><Text font="proto_mono" >{formatDate(proposal.voting_end_time)}</Text></td>
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
      
    </div>
  );
};

export default ProposalTable;
