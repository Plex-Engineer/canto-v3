import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Validation,
  errMsg,
} from "@/config/interfaces";
import {
  StakingTransactionParams,
  StakingTxTypes,
} from "../interfaces/stakingTxTypes";

import { createMsgsDelegate } from "@/utils/cosmos/transactions/messages/staking/delegate";

import { createMsgsRedelegate } from "@/utils/cosmos/transactions/messages/staking/redelegate";
import { createMsgsClaimStakingRewards } from "@/utils/cosmos/transactions/messages/staking/claimRewards";
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
import { areEqualAddresses, isValidEthAddress } from "@/utils/address";
import { validateNonWeiUserInputTokenAmount } from "@/utils/math";
import { ValidatorWithDelegations } from "@/hooks/staking/interfaces/validators";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";

export async function stakingTx(
  txParams: StakingTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // convert user eth address into canto address
  const { data: cantoAddress, error } = await ethToCantoAddress(
    txParams.ethAccount
  );
  if (error) {
    return NEW_ERROR("stakingTx::" + errMsg(error));
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
            txParams.validatorAddress,
            txParams.amount,
            false,
            TX_DESCRIPTIONS.DELEGATE(
              txParams.validatorName ?? "",
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
            txParams.validatorAddress,
            txParams.amount,
            txParams.txType === StakingTxTypes.UNDELEGATE,
            TX_DESCRIPTIONS.DELEGATE(
              txParams.validatorName ?? "",
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
            txParams.validatorAddress,
            txParams.newValidatorAddress,
            txParams.amount,
            TX_DESCRIPTIONS.REDELEGATE(
              txParams.validatorName ?? "",
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
  feTxType: CantoFETxType.NONE,
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
  feTxType: CantoFETxType.NONE,
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
  feTxType: CantoFETxType.NONE,
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
): ReturnWithError<Validation> {
  // make sure userEthAddress is set and same as params
  if (!isValidEthAddress(txParams.ethAccount)) {
    return NO_ERROR({
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethAccount"),
    });
  }

  // switch depending on tx type
  switch (txParams.txType) {
    case StakingTxTypes.DELEGATE:
      // amount just has to be less than canto balance
      return NO_ERROR({ error: false });
    case StakingTxTypes.UNDELEGATE:
      return NO_ERROR({ error: false });
    case StakingTxTypes.REDELEGATE: {
      // just need to make sure amount is less than user delegation balance
      //const validator = getValidator(txParams.validatorAddress, staking);
      // if (!validator || !(validator as ValidatorWithDelegations).userDelegation)
      //   return NEW_ERROR("validator not found");
      if (txParams.validatorAddress == txParams.newValidatorAddress) {
        return NEW_ERROR("Same validator Addresses provided");
      }

      return NO_ERROR({ error: false });
      // return validateNonWeiUserInputTokenAmount(
      //   txParams.amount,
      //   "0",
      //   (validator as ValidatorWithDelegations).userDelegation?.balance ?? "0",
      //   "CANTO",
      //   18
      // ).error
      //   ? NO_ERROR({ error: false })
      //   : NEW_ERROR("Invalid input amount");
    }

    case StakingTxTypes.CLAIM_REWARDS: {
      return NO_ERROR({ error: false });
    }
    default:
      return NEW_ERROR("reason: tx type not found");
  }
}