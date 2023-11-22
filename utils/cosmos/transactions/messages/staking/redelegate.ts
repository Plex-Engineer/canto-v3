import { REDELEGATE_FEE } from "@/config/consts/fees";
import { generateCosmosEIPTypes } from "@/transactions/cosmos/messages/base";
import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/transactions/interfaces";
import { Coin } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/base/v1beta1/coin_pb";
import { MsgBeginRedelegate } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/staking/v1beta1/tx_pb.js";

const MSG_BEGIN_REDELEGATE_TYPES = {
  MsgValue: [
    { name: "delegator_address", type: "string" },
    { name: "validator_src_address", type: "string" },
    { name: "validator_dst_address", type: "string" },
    { name: "amount", type: "TypeAmount" },
  ],
  TypeAmount: [
    { name: "denom", type: "string" },
    { name: "amount", type: "string" },
  ],
};
interface MessageRedelegateParams {
  delegatorCantoAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  amount: string;
  denom: string;
}

/**
 * @notice creates eip712 and cosmos proto messages for redelegating
 * @param {MessageRedelegateParams} params redelegate parameters
 * @returns {UnsignedCosmosMessages} eip and cosmos messages along with types object and fee
 */
export function createMsgsRedelegate(
  params: MessageRedelegateParams
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgRedelegate(params);
  const cosmosMsg = protoMsgRedelegate(params);

  return {
    eipMsg,
    cosmosMsg,
    fee: REDELEGATE_FEE,
    typesObject: generateCosmosEIPTypes(MSG_BEGIN_REDELEGATE_TYPES),
  };
}

function eip712MsgRedelegate(params: MessageRedelegateParams): EIP712Message {
  return {
    type: "cosmos-sdk/MsgBeginRedelegate",
    value: {
      amount: {
        amount: params.amount,
        denom: params.denom,
      },
      delegator_address: params.delegatorCantoAddress,
      validator_dst_address: params.validatorDstAddress,
      validator_src_address: params.validatorSrcAddress,
    },
  };
}

function protoMsgRedelegate(
  params: MessageRedelegateParams
): CosmosNativeMessage {
  const value = new Coin({
    denom: params.denom,
    amount: params.amount,
  });
  const message = new MsgBeginRedelegate({
    delegatorAddress: params.delegatorCantoAddress,
    validatorSrcAddress: params.validatorSrcAddress,
    validatorDstAddress: params.validatorDstAddress,
    amount: value,
  });
  // add serializeBinary function for signing package
  return {
    message: { ...message, serializeBinary: () => message.toBinary() },
    path: MsgBeginRedelegate.typeName,
  };
}
