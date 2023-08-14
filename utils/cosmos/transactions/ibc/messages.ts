import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { MsgTransfer } from "@buf/cosmos_ibc.bufbuild_es/ibc/applications/transfer/v1/tx_pb.js";
import { Height } from "@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb.js";
import { Coin } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/base/v1beta1/coin_pb";
import { IBC_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "../../types/base";
import { IBC_MSG_TYPES } from "../../types/ibc";

interface MessageIBCOutParams {
  // Channel
  sourcePort: string;
  sourceChannel: string;
  // Token
  amount: string;
  denom: string;
  // Addresses
  cosmosReceiver: string;
  cantoSender: string;
  // Timeout
  revisionNumber: number;
  revisionHeight: number;
  timeoutTimestamp: string;
  // Memo
  memo: string;
}
export function createMsgsIBCOut(
  params: MessageIBCOutParams
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgIBCOut(params);
  const cosmosMsg = protoMsgIBCOut(params);
  return {
    eipMsg,
    cosmosMsg,
    fee: IBC_FEE,
    typesObject: generateCosmosEIPTypes(IBC_MSG_TYPES),
  };
}

function eip712MsgIBCOut(params: MessageIBCOutParams): EIP712Message {
  return {
    type: "cosmos-sdk/MsgTransfer",
    value: {
      receiver: params.cosmosReceiver,
      sender: params.cantoSender,
      source_channel: params.sourceChannel,
      source_port: params.sourcePort,
      timeout_height: {
        revision_height: params.revisionHeight.toString(),
        revision_number: params.revisionNumber.toString(),
      },
      timeout_timestamp: params.timeoutTimestamp,
      token: {
        amount: params.amount,
        denom: params.denom,
      },
      memo: params.memo,
    },
  };
}

function protoMsgIBCOut(params: MessageIBCOutParams): CosmosNativeMessage {
  return {
    message: new MsgTransfer({
      sourcePort: params.sourcePort,
      sourceChannel: params.sourceChannel,
      token: new Coin({
        denom: params.denom,
        amount: params.amount,
      }),
      sender: params.cantoSender,
      receiver: params.cosmosReceiver,
      timeoutHeight: new Height({
        revisionNumber: BigInt(params.revisionNumber),
        revisionHeight: BigInt(params.revisionHeight),
      }),
      timeoutTimestamp: BigInt(parseInt(params.timeoutTimestamp, 10)),
      memo: params.memo,
    }),
    path: MsgTransfer.typeName,
  };
}
