import { CLAIM_STAKING_REWARD_FEE } from "@/config/consts/fees";
import {
  CosmosNativeMessage,
  EIP712Message,
  UnsignedCosmosMessages,
} from "@/config/interfaces/transactions";
import { generateCosmosEIPTypes } from "../base";
import { MsgWithdrawDelegatorReward } from "@buf/cosmos_cosmos-sdk.bufbuild_es/cosmos/distribution/v1beta1/tx_pb.js";

const MSG_WITHDRAW_DELEGATOR_REWARD_TYPES = {
  MsgValue: [
    { name: "delegator_address", type: "string" },
    { name: "validator_address", type: "string" },
  ],
};

interface MessageClaimStakingRewardsMultipleValidatorsParams {
  delegatorCantoAddress: string;
  validatorAddresses: string[];
}

/**
 * @notice creates eip712 and cosmos proto messages for claiming staking rewards
 * @param {MessageClaimStakingRewardsMultipleValidatorsParams} params claim staking rewards parameters
 * @returns {UnsignedCosmosMessages} eip and cosmos messages along with types object and fee
 */
export function createMsgsClaimStakingRewards(
  params: MessageClaimStakingRewardsMultipleValidatorsParams
): UnsignedCosmosMessages {
  const eipMsg = params.validatorAddresses.map((valAdd) =>
    eip712MsgClaimRewardsSingleValidator({
      delegatorCantoAddress: params.delegatorCantoAddress,
      validatorAddress: valAdd,
    })
  );
  const cosmosMsg = params.validatorAddresses.map((valAdd) =>
    protoMsgClaimRewardsSingleValidator({
      delegatorCantoAddress: params.delegatorCantoAddress,
      validatorAddress: valAdd,
    })
  );

  return {
    eipMsg,
    cosmosMsg,
    fee: CLAIM_STAKING_REWARD_FEE,
    typesObject: generateCosmosEIPTypes(MSG_WITHDRAW_DELEGATOR_REWARD_TYPES),
  };
}

// messages are for one validator at a time to claim rewards from
// multiple validators, send multiple messages under the same transaction

interface MessageClaimStakingRewardsSingleValidatorParams {
  delegatorCantoAddress: string;
  validatorAddress: string;
}

function eip712MsgClaimRewardsSingleValidator(
  params: MessageClaimStakingRewardsSingleValidatorParams
): EIP712Message {
  return {
    type: "cosmos-sdk/MsgWithdrawDelegationReward",
    value: {
      delegator_address: params.delegatorCantoAddress,
      validator_address: params.validatorAddress,
    },
  };
}

function protoMsgClaimRewardsSingleValidator(
  params: MessageClaimStakingRewardsSingleValidatorParams
): CosmosNativeMessage {
  const message = new MsgWithdrawDelegatorReward({
    delegatorAddress: params.delegatorCantoAddress,
    validatorAddress: params.validatorAddress,
  });
  // add serializeBinary function for signing package
  return {
    message: { ...message, serializeBinary: () => message.toBinary() },
    path: MsgWithdrawDelegatorReward.typeName,
  };
}
