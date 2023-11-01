import React from 'react';
import Filter from '../Filter/Filter';
import styles from './ProposalTable.module.scss';
import { Proposal } from '@/hooks/gov/interfaces/proposal';
import { formatDate, formatProposalStatus, formatProposalType } from '@/utils/gov/formatData';
import Text from '@/components/text';


interface TableProps {
  proposals: Proposal[];
}

const ProposalTable: React.FC<TableProps> = ({ proposals }) => {
  

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
  const [filteredProposals, setFilteredProposals] = React.useState<Proposal[]>(proposals);
  console.log(filteredProposals.length);
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
      {filteredProposals.length==0 ? <div><div className={styles.table}>No Proposals available</div></div> : 
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
          {filteredProposals.map((proposal,index) => (
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
      
    </div>
  );
};

export default ProposalTable;
