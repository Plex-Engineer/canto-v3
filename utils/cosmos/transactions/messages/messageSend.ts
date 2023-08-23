import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { MsgSend } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/bank/v1beta1/tx_pb.js";
import { Coin } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/base/v1beta1/coin_pb";
import { generateCosmosEIPTypes } from "./base";
import { PUB_KEY_FEE } from "@/config/consts/fees";

const MSG_SEND_TYPES = {
  MsgValue: [
    { name: "from_address", type: "string" },
    { name: "to_address", type: "string" },
    { name: "amount", type: "TypeAmount[]" },
  ],
  TypeAmount: [
    { name: "denom", type: "string" },
    { name: "amount", type: "string" },
  ],
};
interface MessageSendParams {
  fromAddress: string;
  destinationAddress: string;
  amount: string;
  denom: string;
}

/**
 * @notice creates eip712 and cosmos proto messages for sending tokens
 * @param {MessageSendParams} params send parameters
 * @returns {UnsignedCosmosMessages} eip and cosmos messages along with types object and fee
 */
export function createMsgsSend(
  params: MessageSendParams
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgSend(params);
  const cosmosMsg = protoMsgSend(params);
  return {
    eipMsg,
    cosmosMsg,
    fee: PUB_KEY_FEE,
    typesObject: generateCosmosEIPTypes(MSG_SEND_TYPES),
  };
}
function eip712MsgSend(params: MessageSendParams): EIP712Message {
  return {
    type: "cosmos-sdk/MsgSend",
    value: {
      amount: [
        {
          amount: params.amount,
          denom: params.denom,
        },
      ],
      from_address: params.fromAddress,
      to_address: params.destinationAddress,
    },
  };
}

function protoMsgSend(params: MessageSendParams): CosmosNativeMessage {
  const value = new Coin({
    denom: params.denom,
    amount: params.amount,
  });
  const message = new MsgSend({
    fromAddress: params.fromAddress,
    toAddress: params.destinationAddress,
    amount: [value],
  });
  return {
    message,
    path: MsgSend.typeName,
  };
}
