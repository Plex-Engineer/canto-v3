
export interface Proposal {
    proposal_id: string;
    //title: string;
    status: string;
    voting_end_time: string;
    votes_yes : string;
    votes_abstain : string;
    votes_no : string;
    votes_no_with_veto : string;
}