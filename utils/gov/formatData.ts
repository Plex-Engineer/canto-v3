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
interface FinalTallyResult {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  }
  
  interface VoteData {
    yesAmount: string,
    noAmount: string,
    abstainAmount: string,
    no_with_vetoAmount: string,
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  }

export function calculateVotePercentages(finalTallyResult: FinalTallyResult): VoteData {
  // Destructure the vote counts from the object
  const { yes, abstain, no, no_with_veto } = finalTallyResult;

  const factor = BigInt(1e18);
  // Convert the vote counts to BigInts
  const yesVotes = BigInt(yes);
  const abstainVotes = BigInt(abstain);
  const noVotes = BigInt(no);
  const noWithVetoVotes = BigInt(no_with_veto);

  const yesNumber = Number(yesVotes / factor) + Number(yesVotes % factor) / Number(factor);
  const abstainNumber = Number(abstainVotes / factor) + Number(abstainVotes % factor) / Number(factor);
  const noNumber = Number(noVotes / factor) + Number(noVotes % factor) / Number(factor);
  const noWithVetoNumber = Number(noWithVetoVotes / factor) + Number(noWithVetoVotes % factor) / Number(factor);

  //console.log(yesNumber);
  const totalVotesBigInt = yesVotes+noVotes+abstainVotes+noWithVetoVotes;
  const totalVotes = yesNumber + abstainNumber + noNumber + noWithVetoNumber;

  if(totalVotesBigInt==0n){
    return {
        yesAmount: "0",
        noAmount: "0",
        abstainAmount: "0",
        no_with_vetoAmount: "0",
        yes: "0",
        abstain: "0",
        no: "0",
        no_with_veto: "0",
      };
  }
  
  // Calculate percentages and format them as strings
  const yesPercentage = (Number(yesVotes*BigInt(10000) / totalVotesBigInt )/100).toFixed(2);
  const abstainPercentage = (Number(abstainVotes*BigInt(1000000) / totalVotesBigInt )/10000).toFixed(2);
  const noPercentage = (Number(noVotes*BigInt(10000) / totalVotesBigInt )/100).toFixed(2);
  const noWithVetoPercentage = (Number(noWithVetoVotes*BigInt(10000) / totalVotesBigInt )/100).toFixed(2);

  // Convert the vote counts to strings with two decimal places
  const yesString = yesNumber.toFixed(2);
  const abstainString = abstainNumber.toFixed(2);
  const noString = noNumber.toFixed(2);
  const noWithVetoString = noWithVetoNumber.toFixed(2);

  return {
    yesAmount: yesString,
    noAmount: noString,
    abstainAmount: abstainString,
    no_with_vetoAmount: noWithVetoString,
    yes: yesPercentage,
    abstain: abstainPercentage,
    no: noPercentage,
    no_with_veto: noWithVetoPercentage,
  };
}

export function formatDeposit(amount: string): string{
    const factor = BigInt(1e18);
  // Convert the vote counts to BigInts
    const amountBigInt = BigInt(amount);

    return (Number(amountBigInt/factor)+ Number(amountBigInt%factor)/Number(factor)).toFixed(0);
}

export function formatTime(input: string): string {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const suffixes = ["th", "st", "nd", "rd"];
  
    const date = new Date(input);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const seconds = `0${date.getSeconds()}`.slice(-2);
  
    // Determine the appropriate day suffix
    const daySuffix = (day % 10 < 4 && day % 100 !== 11 && day % 100 !== 12 && day % 100 !== 13) ? suffixes[day % 10] : suffixes[0];
  
    return `${months[monthIndex]} ${day}${daySuffix},${year} ${hours % 12 || 12}:${minutes}:${seconds} ${hours >= 12 ? 'PM' : 'AM'}`;
  }
  

