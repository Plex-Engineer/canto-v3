import { NewProposal, Proposal, Proposal2 } from "./proposal";

export interface ProposalHookParams {
  chainId: number;
}
export interface ProposalHookReturn {
  proposals: NewProposal[];
}

export interface ProposalHookReturnSingle{
  proposal: Proposal2 | undefined;
}
