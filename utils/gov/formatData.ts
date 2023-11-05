// export function formatDate(voting_end_time: string): string {
//     const date = new Date(voting_end_time);
    
//     const day = String(date.getUTCDate()).padStart(2, '0');
//     const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//     const year = String(date.getUTCFullYear()).slice(-2);

//     return `${day}/${month}/${year}`;
// }
export function formatDate(voting_end_time: string): string {
    const date = new Date(voting_end_time);

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear() % 100;

    const dayWithOrdinal = addOrdinalIndicator(day);

    return `${dayWithOrdinal} ${month},${year}`;
}

// Function to add ordinal indicator (st, nd, rd, or th) to a number
function addOrdinalIndicator(day: number): string {
    if (day >= 11 && day <= 13) {
        return `${day}th`;
    }
    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}


const proposalTypes = {
    '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal': 'Software Upgrade',
    '/cosmos.params.v1beta1.ParameterChangeProposal': 'Parameter Change',
    '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal': 'Community Pool Spend',
    '/canto.govshuttle.v1.LendingMarketProposal': 'Lending Market',
    '/cosmos.gov.v1beta1.TextProposal': 'Text',
    '/canto.erc20.v1.RegisterCoinProposal': 'Register Coin'
};


export function formatProposalStatus(status:string): string | undefined{
    switch(status){
        case 'PROPOSAL_STATUS_ACTIVE':
            return 'ACTIVE';
        case 'PROPOSAL_STATUS_PASSED':
            return 'PASSED';
        case 'PROPOSAL_STATUS_REJECTED':
            return 'REJECTED';
        case 'PROPOSAL_STATUS_FAILED':
            return 'FAILED';
        case 'PROPOSAL_STATUS_DEPOSIT_PERIOD':
            return 'DEPOSIT';
        case 'PROPOSAL_STATUS_VOTING_PERIOD':
            return 'ACTIVE';
        case 'PROPOSAL_STATUS_UNSPECIFIED':
            return undefined;
        default:
            return undefined;
        
    }
}
  
export function formatProposalType(type_url: string){
    return (proposalTypes as any)[type_url] || 'Proposal type not found';
}


