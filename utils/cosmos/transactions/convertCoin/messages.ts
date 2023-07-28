import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import * as erc20 from "../../prototypes/proto-tx";
import { CONVERT_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "../../types/base";
import { MSG_CONVERT_ERC20_TYPES } from "../../types/convertCoin";

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
  return {
    message: new erc20.evmos.erc20.v1.MsgConvertERC20(params),
    path: "canto.erc20.v1.MsgConvertERC20",
  };
}
