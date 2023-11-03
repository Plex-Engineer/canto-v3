import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
  errMsg,
} from "@/config/interfaces";
import { ethToCantoAddress } from "@/utils/address.utils";
import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
//import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
import { voteOptionToNumber } from "../interfaces/voteOptions";
import { ProposalVoteTxParams } from "../interfaces/voteTxParams";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";

export async function proposalVoteTx(
  params: ProposalVoteTxParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // convert eth address to canto address
  const { data: cantoAddress, error: ethToCantoError } =
    await ethToCantoAddress(params.ethAccount);
  if (ethToCantoError) {
    return NEW_ERROR("proposalVoteTx::" + errMsg(ethToCantoError));
  }
  // get voting option as a number
  const numVoteOption = voteOptionToNumber(params.voteOption);
  if (numVoteOption === 0) {
    return NEW_ERROR("proposalVoteTx: invalid vote option");
  }

  return NO_ERROR({
    transactions: [
    _voteTx(
      params.chainId,
      cantoAddress,
      params.proposalId,
      numVoteOption,
      TX_DESCRIPTIONS.VOTE(params.proposalId, params.voteOption)
    ),
  ]});
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
