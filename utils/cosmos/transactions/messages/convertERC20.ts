import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { CONVERT_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "../types/base";
import { MSG_CONVERT_ERC20_TYPES } from "../types/convertCoin";
import { MsgConvertERC20 } from "@buf/evmos_evmos.bufbuild_es/evmos/erc20/v1/tx_pb.js";
interface MsgConvertERC20Params {
  contract_address: string;
  amount: string;
  receiver: string;
  sender: string;
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
      receiver: params.receiver,
      sender: params.sender,
    },
  };
}

function protoMsgConvertERC20(
  params: MsgConvertERC20Params
): CosmosNativeMessage {
  const message = new MsgConvertERC20({
    contractAddress: params.contract_address,
    amount: params.amount,
    receiver: params.receiver,
    sender: params.sender,
  });
  // add serializeBinary function for signing package
  return {
    message: { ...message, serializeBinary: () => message.toBinary() },
    path: "canto.erc20.v1.MsgConvertERC20",
  };
}
