import { Proposal } from "./proposal";

export interface ProposalHookParams {
  chainId: number;
}
export interface ProposalHookReturn {
  proposals: Proposal[];
  isProposalsLoading: boolean;
}
