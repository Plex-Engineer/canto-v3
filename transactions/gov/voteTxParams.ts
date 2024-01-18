import { VoteOption } from "./voteOptions";

export interface ProposalVoteTxParams {
  chainId: number;
  ethAccount: string;
  proposalId: number;
  voteOption: VoteOption;
}
