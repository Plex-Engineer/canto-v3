import React from 'react';
import Filter from '../Filter/Filter';
import styles from './ProposalTable.module.scss';
import { Proposal } from '@/hooks/gov/interfaces/proposal';
import { formatDate, formatProposalStatus, formatProposalType } from '@/utils/gov/formatData';


interface TableProps {
  proposals: Proposal[];
}

const ProposalTable: React.FC<TableProps> = ({ proposals }) => {
  const [filteredProposals, setFilteredProposals] = React.useState<Proposal[]>(proposals);

  const handleFilterChange = (filter: string) => {
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
  };
  if(proposals.length==0){
    return (
      <div>Proposals Not Available Yet</div>
    );
  }
  function test(index: number):string{
    let s = '';
    for(var i=0;i<(index%20);i++){
      s = s + 'Test Ts ';
    }
    return s;
  }
  return (
    <div className={styles.tableContainer}>
      <Filter onFilterChange={handleFilterChange} currentFilter='All' />
      <table className={styles.table}>
        <thead>
          <tr key='proposalTableHeader'>
            <th className={styles.tableHeader}>ID</th>
            <th className={styles.tableHeader}>Title</th>
            <th className={styles.tableHeader}>Status</th>
            <th className={styles.tableHeader}>Type</th>
            <th className={styles.tableHeader}>Voting Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredProposals.map((proposal,index) => (
            <tr className={styles.row} key={proposal.proposal_id}>
              {/* <div>PROPOSALS</div> */}
              <td className={styles.tableData}>{proposal.proposal_id}</td>
              <td className={styles.tableTitleColumn}>PROPOSAL TITLE</td>
              <td className={styles.tableData}>{formatProposalStatus(proposal.status)}</td>
              <td className={styles.tableData}>{formatProposalType(proposal.type_url)}</td>
              <td className={styles.tableData}>{formatDate(proposal.voting_end_time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProposalTable;
