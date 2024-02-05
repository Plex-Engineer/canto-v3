import { ProposalVoteTxParams } from "@/transactions/gov";
import { Proposal } from "./proposal";
import { NewTransactionFlow } from "@/transactions/flows";

export interface ProposalHookParams {
  chainId: number;
}
export interface ProposalHookReturn {
  proposals: Proposal[];
  isProposalsLoading: boolean;
  newVoteFlow: (txParams: ProposalVoteTxParams) => NewTransactionFlow;
}
