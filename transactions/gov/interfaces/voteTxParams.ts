import { VoteOption } from "../../../hooks/gov/interfaces/voteOptions";

export interface ProposalVoteTxParams {
  chainId: number;
  ethAccount: string;
  proposalId: number;
  voteOption: VoteOption;
}
