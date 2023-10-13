import { CTokenWithUserData } from "./tokens";

export enum CTokenLendingTxTypes {
  SUPPLY = "Supply",
  BORROW = "Borrow",
  REPAY = "Repay",
  WITHDRAW = "Withdraw",
  COLLATERALIZE = "Collateralize",
  DECOLLATERALIZE = "Decollateralize",
}

export interface CTokenLendingTransactionParams {
  chainId: number;
  ethAccount: string;
  txType: CTokenLendingTxTypes;
  cToken: CTokenWithUserData;
  amount: string;
}

export interface CLMClaimRewardsTxParams {
  chainId: number;
  ethAccount: string;
  estimatedRewards: string; // estimation before distribution of rewards, only used for drip purposes (all rewards will be claimed)
}
