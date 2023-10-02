import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
  TransactionDescription,
  errMsg,
} from "@/config/interfaces";
import { ethToCantoAddress } from "@/utils/address.utils";
import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
import { VotingOption, voteOptionToNumber } from "../helpers/voteOptions";

export interface ProposalVoteTx {
  chainId: number;
  ethSender: string;
  proposalId: number;
  voteOption: VotingOption;
}
export async function proposalVoteTx(
  params: ProposalVoteTx
): PromiseWithError<Transaction[]> {
  // check params here

  // get voting option as a number
  const numVoteOption = voteOptionToNumber(params.voteOption);
  if (numVoteOption === 0) {
    return NEW_ERROR("proposalVoteTx: invalid vote option");
  }
  // get canto address
  const { data: cantoAddress, error: ethToCantoError } =
    await ethToCantoAddress(params.ethSender);
  if (ethToCantoError) {
    return NEW_ERROR("proposalVoteTx::" + errMsg(ethToCantoError));
  }
  return NO_ERROR([
    _voteTx(params.chainId, cantoAddress, params.proposalId, numVoteOption, {
      title: "Vote",
      description: "Vote on a proposal",
    }),
  ]);
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _voteTx = (
  chainId: number,
  cosmosSender: string,
  proposalId: number,
  option: number,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "COSMOS",
  msg: createMsgsVote({
    sender: cosmosSender,
    proposalId,
    option,
  }),
});
