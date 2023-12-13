
import { MsgVote } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/gov/v1beta1/tx_pb.js";

import { VOTING_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "@/transactions/cosmos/messages/base";
import { CosmosNativeMessage, EIP712Message, UnsignedCosmosMessages } from "@/transactions/interfaces/txCosmos";

const MSG_VOTE_TYPES = {
  MsgValue: [
    { name: "proposal_id", type: "uint64" },
    { name: "voter", type: "string" },
    { name: "option", type: "int32" },
  ],
};
interface MessageVoteParams {
  sender: string;
  proposalId: number;
  option: number;
}

export function createMsgsVote(
  params: MessageVoteParams
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgVote(params);
  const cosmosMsg = protoMsgVote(params);
  return {
    eipMsg,
    cosmosMsg,
    fee: VOTING_FEE,
    typesObject: generateCosmosEIPTypes(MSG_VOTE_TYPES),
  };
}

function eip712MsgVote(params: MessageVoteParams): EIP712Message {
  return {
    type: "cosmos-sdk/MsgVote",
    value: {
      proposal_id: params.proposalId,
      voter: params.sender,
      option: params.option,
    },
  };
}

function protoMsgVote(params: MessageVoteParams): CosmosNativeMessage {
  const voteMsg = new MsgVote({
    proposalId: BigInt(params.proposalId),
    voter: params.sender,
    option: params.option,
  });
  return {
    message: { ...voteMsg, serializeBinary: () => voteMsg.toBinary() },
    path: MsgVote.typeName,
  };
}
