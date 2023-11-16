import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";

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
  max: boolean; // for repay and withdraw, if all tokens should be repaid/withdrawn
  userPosition?: UserLMPosition; // for validation
}

export interface CLMClaimRewardsTxParams {
  chainId: number;
  ethAccount: string;
  estimatedRewards: string; // estimation before distribution of rewards, only used for drip purposes (all rewards will be claimed)
}
