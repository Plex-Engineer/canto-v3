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
