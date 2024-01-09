import { Proposal, Proposal2 } from "./proposal";

export interface ProposalHookParams {
  chainId: number;
}
export interface ProposalHookReturn {
  proposals: Proposal[],
  isProposalsLoading: boolean
}

export interface ProposalHookReturnSingle{
  proposal: Proposal2 | undefined;
}
