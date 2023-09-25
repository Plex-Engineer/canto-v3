import { PairWithUserCTokenData } from "./pairs";

export enum PairsTxTypes {
  ADD_LIQUIDITY = "Add Liquidity",
  STAKE = "Stake",
  ADD_LIQUIDITY_AND_STAKE = "Add Liquidity and Stake",
  REMOVE_LIQUIDITY = "Remove Liquidity",
  UNSTAKE = "Unstake",
  UNSTAKE_AND_REMOVE_LIQUIDITY = "Unstake and Remove Liquidity",
}

export interface PairsTransactionParams {
  chainId: number;
  ethAccount: string;
  txType: PairsTxTypes;
  pair: PairWithUserCTokenData;
  amount: string;
}
