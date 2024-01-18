import { ValidatorWithDelegations } from "@/hooks/staking/interfaces/validators";

export enum StakingTxTypes {
  DELEGATE = "Delegate",
  UNDELEGATE = "Undelegate",
  REDELEGATE = "Redelegate",
  CLAIM_REWARDS = "Claim Rewards",
}

export type StakingTransactionParams = {
  chainId: number;
  ethAccount: string;
} & (
  | {
      txType: StakingTxTypes.DELEGATE | StakingTxTypes.UNDELEGATE;
      validator: ValidatorWithDelegations;
      amount: string;
      nativeBalance: string;
    }
  | {
      txType: StakingTxTypes.REDELEGATE;
      validator: ValidatorWithDelegations;
      amount: string;
      newValidatorAddress: string;
      newValidatorName?: string;
    }
  | {
      txType: StakingTxTypes.CLAIM_REWARDS;
      validatorAddresses: string[];
    }
);
