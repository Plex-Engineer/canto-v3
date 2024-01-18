import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { StakingTransactionParams, StakingTxTypes } from "./types";
import { createMsgsDelegate } from "@/transactions/cosmos/messages/staking/delegate";
import { createMsgsRedelegate } from "@/transactions/cosmos/messages/staking/redelegate";
import { createMsgsClaimStakingRewards } from "@/transactions/cosmos/messages/staking/claimRewards";
import { ethToCantoAddress } from "@/utils/address/conversion.utils";
import { displayAmount } from "@/utils/formatting/balances.utils";
import {
  CantoFETxType,
  TX_DESCRIPTIONS,
} from "@/transactions/interfaces/txDescriptions";
import {
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { isValidEthAddress } from "@/utils/address";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { validateWeiUserInputTokenAmount } from "@/utils/math";

export async function stakingTx(
  txParams: StakingTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // convert user eth address into canto address
  const { data: cantoAddress, error } = await ethToCantoAddress(
    txParams.ethAccount
  );
  if (error) {
    return NEW_ERROR("stakingTx", error);
  }
  // switch based on tx type
  switch (txParams.txType) {
    case StakingTxTypes.DELEGATE:
      return NO_ERROR({
        transactions: [
          _delegateTx(
            txParams.ethAccount,
            txParams.chainId,
            cantoAddress,
            txParams.validator.operator_address,
            txParams.amount,
            false,
            TX_DESCRIPTIONS.DELEGATE(
              txParams.validator.description.moniker,
              displayAmount(txParams.amount, 18),
              false
            )
          ),
        ],
      });
    case StakingTxTypes.UNDELEGATE:
      return NO_ERROR({
        transactions: [
          _delegateTx(
            txParams.ethAccount,
            txParams.chainId,
            cantoAddress,
            txParams.validator.operator_address,
            txParams.amount,
            txParams.txType === StakingTxTypes.UNDELEGATE,
            TX_DESCRIPTIONS.DELEGATE(
              txParams.validator.description.moniker,
              displayAmount(txParams.amount, 18),
              txParams.txType === StakingTxTypes.UNDELEGATE
            )
          ),
        ],
      });
    case StakingTxTypes.REDELEGATE:
      return NO_ERROR({
        transactions: [
          _redelegateTx(
            txParams.ethAccount,
            txParams.chainId,
            cantoAddress,
            txParams.validator.operator_address,
            txParams.newValidatorAddress,
            txParams.amount,
            TX_DESCRIPTIONS.REDELEGATE(
              txParams.validator.description.moniker,
              txParams.newValidatorName ?? "",
              displayAmount(txParams.amount, 18)
            )
          ),
        ],
      });
    case StakingTxTypes.CLAIM_REWARDS:
      return NO_ERROR({
        transactions: [
          _claimRewardsTx(
            txParams.ethAccount,
            txParams.chainId,
            cantoAddress,
            txParams.validatorAddresses,
            TX_DESCRIPTIONS.CLAIM_STAKING_REWARDS()
          ),
        ],
      });
    default:
      return NEW_ERROR("stakingTx::tx type not found");
  }
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _delegateTx = (
  ethAddress: string,
  chainId: number,
  delegatorCantoAddress: string,
  validatorAddress: string,
  amount: string,
  undelegate: boolean,
  description: TransactionDescription
): Transaction => ({
  fromAddress: ethAddress,
  feTxType: undelegate ? CantoFETxType.UNDELEGATE : CantoFETxType.DELEGATE,
  description,
  chainId: chainId,
  type: "COSMOS",
  msg: createMsgsDelegate({
    delegatorCantoAddress,
    validatorAddress,
    amount,
    denom: "acanto",
    undelegate,
  }),
});

const _redelegateTx = (
  ethAddress: string,
  chainId: number,
  delegatorCantoAddress: string,
  validatorSrcAddress: string,
  validatorDstAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  fromAddress: ethAddress,
  description,
  chainId: chainId,
  feTxType: CantoFETxType.REDELEGATE,
  type: "COSMOS",
  msg: createMsgsRedelegate({
    delegatorCantoAddress,
    validatorSrcAddress,
    validatorDstAddress,
    amount,
    denom: "acanto",
  }),
});

const _claimRewardsTx = (
  ethAddress: string,
  chainId: number,
  delegatorCantoAddress: string,
  validatorAddresses: string[],
  description: TransactionDescription
): Transaction => ({
  fromAddress: ethAddress,
  feTxType: CantoFETxType.CLAIM_STAKING_REWARDS,
  description,
  chainId: chainId,
  type: "COSMOS",
  msg: createMsgsClaimStakingRewards({
    delegatorCantoAddress,
    validatorAddresses,
  }),
});

export function validateStakingTxParams(
  txParams: StakingTransactionParams
): Validation {
  // make sure userEthAddress is set and same as params
  if (!isValidEthAddress(txParams.ethAccount)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethAccount"),
    };
  }

  // switch depending on tx type
  switch (txParams.txType) {
    case StakingTxTypes.DELEGATE:
      // amount just has to be less than canto balance
      return validateWeiUserInputTokenAmount(
        txParams.amount,
        "1",
        txParams.nativeBalance,
        "CANTO",
        18
      );
    case StakingTxTypes.UNDELEGATE:
      // just need to make sure amount is less than user delegation balance
      return validateWeiUserInputTokenAmount(
        txParams.amount,
        "1",
        txParams.validator.userDelegation.balance,
        "CANTO",
        18
      );
    case StakingTxTypes.REDELEGATE: {
      //make sure newValidatorAddress is different than validatorAddress
      if (txParams.validator.operator_address == txParams.newValidatorAddress) {
        return { error: true, reason: "Same validator Addresses provided" };
      }
      if (txParams.newValidatorAddress == "") {
        return { error: true, reason: "No validator address provided" };
      }
      // make sure amount is less than user delegation balance
      return validateWeiUserInputTokenAmount(
        txParams.amount,
        "1",
        txParams.validator.userDelegation.balance,
        "CANTO",
        18
      );
    }
    case StakingTxTypes.CLAIM_REWARDS: {
      return { error: false };
    }
    default:
      return { error: true, reason: "reason: tx type not found" };
  }
}
