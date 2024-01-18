import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Validation,
  errMsg,
} from "@/config/interfaces";

import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
//import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
import { voteOptionToNumber } from "../../../hooks/gov/interfaces/voteOptions";
import { ProposalVoteTxParams } from "../interfaces/voteTxParams";

import { ethToCantoAddress } from "@/utils/address/conversion.utils";
import {
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces/txBase";
import {
  CantoFETxType,
  TX_DESCRIPTIONS,
} from "@/transactions/interfaces/txDescriptions";
import { isValidEthAddress } from "@/utils/address";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";

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
        params.ethAccount,
        params.chainId,
        cantoAddress,
        params.proposalId,
        numVoteOption,
        TX_DESCRIPTIONS.VOTE(params.proposalId, params.voteOption)
      ),
    ],
  });
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _voteTx = (
  ethAddress: string,
  chainId: number,
  cosmosSender: string,
  proposalId: number,
  option: number,
  description: TransactionDescription
): Transaction => ({
  fromAddress: ethAddress,
  feTxType: CantoFETxType.NONE,
  description,
  chainId: chainId,
  type: "COSMOS",
  msg: createMsgsVote({
    sender: cosmosSender,
    proposalId,
    option,
  }),
});

export const validateGovTxParams = (
  txParams: ProposalVoteTxParams
): ReturnWithError<Validation> => {
  if (!isValidEthAddress(txParams.ethAccount)) {
    return NO_ERROR({
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethAccount"),
    });
  }
  return NO_ERROR({ error: false });
};
