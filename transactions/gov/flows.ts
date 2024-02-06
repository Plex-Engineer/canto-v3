import { ProposalVoteTxParams } from ".";
import { NewTransactionFlow, TransactionFlowType } from "../flows";

export const newVoteFlow = (
  txParams: ProposalVoteTxParams
): NewTransactionFlow => ({
  title: "Voting",
  icon: "/canto.svg",
  txType: TransactionFlowType.VOTE_TX,
  params: txParams,
});
