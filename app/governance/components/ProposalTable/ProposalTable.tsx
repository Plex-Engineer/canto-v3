import React from 'react';
import Filter from '../Filter/Filter';
import styles from './ProposalTable.module.scss';
import { Proposal } from '@/hooks/gov/interfaces/proposal';


interface TableProps {
  proposals: Proposal[];
}

const ProposalTable: React.FC<TableProps> = ({ proposals }) => {
  const [filteredProposals, setFilteredProposals] = React.useState<Proposal[]>(proposals);

  const handleFilterChange = (filter: string) => {
    if (filter === 'All') {
      setFilteredProposals(proposals);
    } else {
      setFilteredProposals(proposals.filter(proposal => proposal.status === filter));
    }
  };

  return (
    <div className={styles.tableContainer}>
      <Filter onFilterChange={handleFilterChange} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Type</th>
            <th>Voting Date</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map(proposal => (
            <div className={styles.id} key={proposal.proposal_id}>
            <div className={styles.id}>{proposal.proposal_id}</div>
            <div className={styles.title}>Proposal Title</div>
            <div className={styles.status}>{proposal.status}</div>
            <div className={styles.type}>{proposal.type_url}</div>
            <div className="column votingDate">{proposal.voting_end_time}</div>
          </div>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProposalTable;
