import {
  NEW_ERROR,
  NO_ERROR,
  NewTransactionFlow,
  PromiseWithError,
  Transaction,
  TransactionDescription,
  errMsg,
} from "@/config/interfaces";
import { ethToCantoAddress } from "@/utils/address.utils";
import { createMsgsVote } from "@/utils/cosmos/transactions/messages/voting/vote";
import { VotingOption, voteOptionToNumber } from "../helpers/voteOptions";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { GetWalletClientResult } from "wagmi/actions";
import { TransactionStore } from "@/stores/transactionStore";

export interface ProposalVoteTx {
  chainId: number;
  ethSender: string;
  proposalId: number;
  voteOption: VotingOption;
}
export interface voteTxParams{
  proposal_id:Number, 
  voteOption: VotingOption,
  signer: GetWalletClientResult | undefined , 
  txStore:TransactionStore | undefined
}
export function castVoteTest(params:voteTxParams):void {
      const voteFlow: NewTransactionFlow = {
      title: "Cast vote for the proposal",
      icon: "",
      txType: TransactionFlowType.VOTE_TX,
      params: {
          chainId: params.signer?.chain.id,
          proposalId: params.proposal_id,
          voteOption: params.voteOption,
          ethSender: params.signer?.account.address,
      },
      };
      params.txStore?.addNewFlow({
        txFlow: voteFlow,
        signer: params.signer,
      });
}

export async function proposalVoteTx(
  params: ProposalVoteTx
): PromiseWithError<Transaction[]> {
  // check params here
  console.log("params");
  console.log(params);
  // get voting option as a number
  const numVoteOption = voteOptionToNumber(params.voteOption);
  if (numVoteOption === 0) {
    return NEW_ERROR("proposalVoteTx: invalid vote option");
  }
  // get canto address
  // const { data: cantoAddress, error: ethToCantoError } = ------------------------------------------Change this Line-------------------------------
  //   await ethToCantoAddress(params.ethSender);
  // console.log(ethToCantoError);
  // if (ethToCantoError) {
  //   return NEW_ERROR("proposalVoteTx::" + errMsg(ethToCantoError));
  // }
  const cantoAddress = "canto16ffhftjpy5r6ugfg9e4fz5advhr2s2a2ng4nhr";
  console.log(cantoAddress);
  
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
