import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { CONVERT_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "../base";
import { MsgConvertERC20 } from "@buf/evmos_evmos.bufbuild_es/evmos/erc20/v1/tx_pb.js";

///
/// Convert ERC20 to native token on canto
///

const MSG_CONVERT_ERC20_TYPES = {
  MsgValue: [
    { name: "contract_address", type: "string" },
    { name: "amount", type: "string" },
    { name: "receiver", type: "string" },
    { name: "sender", type: "string" },
  ],
};
interface MsgConvertERC20Params {
  contract_address: string;
  amount: string;
  cantoReceiver: string;
  ethSender: string;
}
export function createMsgsConvertERC20(
  params: MsgConvertERC20Params
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgConvertERC20(params);
  const cosmosMsg = protoMsgConvertERC20(params);
  return {
    eipMsg,
    cosmosMsg,
    fee: CONVERT_FEE,
    typesObject: generateCosmosEIPTypes(MSG_CONVERT_ERC20_TYPES),
  };
}

function eip712MsgConvertERC20(params: MsgConvertERC20Params): EIP712Message {
  return {
    type: "canto/MsgConvertERC20",
    value: {
      contract_address: params.contract_address,
      amount: params.amount,
      receiver: params.cantoReceiver,
      sender: params.ethSender,
    },
  };
}

function protoMsgConvertERC20(
  params: MsgConvertERC20Params
): CosmosNativeMessage {
  const message = new MsgConvertERC20({
    contractAddress: params.contract_address,
    amount: params.amount,
    receiver: params.cantoReceiver,
    sender: params.ethSender,
  });
  // add serializeBinary function for signing package
  return {
    message: { ...message, serializeBinary: () => message.toBinary() },
    path: "canto.erc20.v1.MsgConvertERC20",
  };
}
