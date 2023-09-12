import { CTokenWithUserData } from "./tokens";

export enum CTokenLendingTxTypes {
  SUPPLY = "supply",
  BORROW = "borrow",
  REPAY = "repay",
  WITHDRAW = "withdraw",
  COLLATERALIZE = "collateralize",
  DECOLLATERALIZE = "decollateralize",
}

export interface CTokenLendingTransactionParams {
  chainId: number;
  ethAccount: string;
  txType: CTokenLendingTxTypes;
  cToken: CTokenWithUserData;
  amount: string;
}
