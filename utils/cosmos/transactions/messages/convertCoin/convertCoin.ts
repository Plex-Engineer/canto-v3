import { MsgConvertCoin } from "@buf/evmos_evmos.bufbuild_es/evmos/erc20/v1/tx_pb.js";
import { Coin } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/base/v1beta1/coin_pb";
import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { generateCosmosEIPTypes } from "../base";
import { CONVERT_FEE } from "@/config/consts/fees";

///
/// Convert native token on Canto to ERC20 token
///

const MSG_CONVERT_COIN_TYPES = {
  MsgValue: [
    { name: "coin", type: "TypeCoin" },
    { name: "receiver", type: "string" },
    { name: "sender", type: "string" },
  ],
  TypeCoin: [
    { name: "denom", type: "string" },
    { name: "amount", type: "string" },
  ],
};
interface MsgConvertCoinParams {
  ethReceiver: string;
  cantoSender: string;
  denom: string;
  amount: string;
}

/**
 * @notice creates eip712 and cosmos proto messages for converting native token on Canto to ERC20 token
 * @param {MsgConvertCoinParams} params convert coin parameters
 * @returns {UnsignedCosmosMessages} eip and cosmos messages along with types object and fee
 */
export function createMsgsConvertCoin(
  params: MsgConvertCoinParams
): UnsignedCosmosMessages {
  const eipMsg = eip712MsgConvertCoin(params);
  const cosmosMsg = protoMsgConvertCoin(params);
  return {
    eipMsg,
    cosmosMsg,
    fee: CONVERT_FEE,
    typesObject: generateCosmosEIPTypes(MSG_CONVERT_COIN_TYPES),
  };
}

function eip712MsgConvertCoin(params: MsgConvertCoinParams): EIP712Message {
  return {
    type: "canto/MsgConvertCoin",
    value: {
      coin: {
        denom: params.denom,
        amount: params.amount,
      },
      receiver: params.ethReceiver,
      sender: params.cantoSender,
    },
  };
}

function protoMsgConvertCoin(
  params: MsgConvertCoinParams
): CosmosNativeMessage {
  const message = new MsgConvertCoin({
    receiver: params.ethReceiver,
    sender: params.cantoSender,
    coin: new Coin({
      denom: params.denom,
      amount: params.amount,
    }),
  });
  return {
    message,
    path: MsgConvertCoin.typeName,
  };
}
