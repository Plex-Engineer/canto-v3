import { UnsignedCosmosMessages } from "@/transactions/interfaces";
import { createMsgSendToEth as eipSendToEth } from "@gravity-bridge/eip712";
import { createMsgSendToEth as protoSendToEth } from "@gravity-bridge/proto";
import { generateCosmosEIPTypes } from "../base";

const SEND_TO_ETH_MSG_TYPES = {
  MsgValue: [
    { name: "sender", type: "string" },
    { name: "eth_dest", type: "string" },
    { name: "amount", type: "TypeAmount[]" },
    { name: "bridge_fee", type: "TypeBridgeFee[]" },
    { name: "chain_fee", type: "TypeChainFee[]" },
  ],
  TypeAmount: [
    { name: "amount", type: "string" },
    { name: "denom", type: "string" },
  ],
  TypeBridgeFee: [
    { name: "bridge_fee", type: "string" },
    { name: "denom", type: "string" },
  ],
  TypeChainFee: [
    { name: "chain_fee", type: "string" },
    { name: "denom", type: "string" },
  ],
};
const SEND_TO_ETH_FEE = {
  amount: "0",
  denom: "ugraviton",
  gas: "300000",
};

interface MessageSendToEthParams {
  gravitySender: string;
  ethReceiver: string;
  amount: string;
  ibcDenom: string;
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
    params.ibcDenom,
    params.bridgeFee,
    params.chainFee
  );
  const cosmosMessage = protoSendToEth(
    params.gravitySender,
    params.ethReceiver,
    params.amount,
    params.ibcDenom,
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
    typesObject: generateCosmosEIPTypes(SEND_TO_ETH_MSG_TYPES),
  };
}
