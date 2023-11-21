import { UnsignedCosmosMessages } from "@/transactions/interfaces";
import { createMsgSendToEth as eipSendToEth } from "@gravity-bridge/eip712";
import { createMsgSendToEth as protoSendToEth } from "@gravity-bridge/proto";

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
    cosmosMsg: cosmosMessage,
    fee: [],
    // types: null,
  };
}
