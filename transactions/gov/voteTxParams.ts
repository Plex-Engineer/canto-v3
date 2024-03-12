import { Proposal } from "@/hooks/gov/interfaces/proposal";
import { VoteOption } from "./voteOptions";

export interface ProposalVoteTxParams {
  chainId: number;
  ethAccount: string;
  proposalId: number;
  proposal?: Proposal;
  voteOption: VoteOption;
}
