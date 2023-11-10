export interface Proposal2 {
  proposal_id: number;
  type_url: string;
  status: ProposalStatus;
  submit_time: string;
  voting_start_time: string;
  voting_end_time: string;
  deposit_end_time: string;
  total_deposit: {
    denom: string;
    amount: string;
  }[];
  final_vote: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
}

export interface Proposal {
  proposal_id: number;
  content: {
    "@type": string;
    title: string;
    description: string;
    metadata: Object;
  };
  //type_url: string;
  status: ProposalStatus;
  submit_time: string;
  voting_start_time: string;
  voting_end_time: string;
  deposit_end_time: string;
  total_deposit: {
    denom: string;
    amount: string;
  }[];
  final_tally_result: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
}

export interface NewProposal {
  proposal_id: number;
  type_url: string;
  title: string;
  description: string;
  status: ProposalStatus;
  submit_time: string;
  voting_start_time: string;
  voting_end_time: string;
  deposit_end_time: string;
  total_deposit: {
    denom: string;
    amount: string;
  }[];
  final_vote: {
    yes: string;
    abstain: string;
    no: string;
    no_with_veto: string;
  };
}

type ProposalStatus =
  | "PROPOSAL_STATUS_UNSPECIFIED"
  | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
  | "PROPOSAL_STATUS_VOTING_PERIOD"
  | "PROPOSAL_STATUS_PASSED"
  | "PROPOSAL_STATUS_REJECTED"
  | "PROPOSAL_STATUS_FAILED";
