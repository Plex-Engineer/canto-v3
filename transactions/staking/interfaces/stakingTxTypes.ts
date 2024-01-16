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
      validatorAddress: string;
      amount: string;
      validatorName?: string;
    }
  | {
      txType: StakingTxTypes.REDELEGATE;
      validatorAddress: string;
      validatorName?: string;
      amount: string;
      newValidatorAddress: string;
      newValidatorName?: string;
    }
  | {
      txType: StakingTxTypes.CLAIM_REWARDS;
      validatorAddresses: string[];
    }
);
