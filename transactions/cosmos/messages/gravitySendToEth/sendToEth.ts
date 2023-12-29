import { UnsignedCosmosMessages } from "@/transactions/interfaces";
import {
  createMsgSendToEth as eipSendToEth,
  MSG_SEND_TO_ETH_TYPES,
} from "@gravity-bridge/eip712";
import { createMsgSendToEth as protoSendToEth } from "@gravity-bridge/proto";
import { generateCosmosEIPTypes } from "../base";

const SEND_TO_ETH_FEE = {
  amount: "0",
  denom: "ugraviton",
  gas: "300000",
};

interface MessageSendToEthParams {
  gravitySender: string;
  ethReceiver: string;
  amount: string;
  nativeName: string;
  bridgeFee: string;
  chainFee: string;
}
export function createMsgsSendToEth(
  params: MessageSendToEthParams
): UnsignedCosmosMessages {
  const eipMessage = eipSendToEth(
    params.gravitySender,
    params.ethReceiver,
    params.amount,
    params.nativeName,
    params.bridgeFee,
    params.chainFee
  );
  const cosmosMessage = protoSendToEth(
    params.gravitySender,
    params.ethReceiver,
    params.amount,
    params.nativeName,
    params.bridgeFee,
    params.chainFee
  );
  return {
    eipMsg: eipMessage,
    cosmosMsg: {
      message: {
        ...cosmosMessage.message,
        serializeBinary: () => cosmosMessage.message.toBinary(),
      },
      path: cosmosMessage.path,
    },
    fee: SEND_TO_ETH_FEE,
    typesObject: generateCosmosEIPTypes(MSG_SEND_TO_ETH_TYPES),
  };
}
