
export const mapProposalStatus = (status: string | undefined) => {
    switch (status) {
      case 'PROPOSAL_STATUS_ACTIVE':
        return 'ACTIVE';
      case 'PROPOSAL_STATUS_REJECTED':
        return 'REJECTED';
      case 'PROPOSAL_STATUS_PASSED':
        return 'PASSED';
      default:
        return status;
    }
};


