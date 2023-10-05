import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { CantoDexPairWithUserCTokenData } from "./pairs";

export enum CantoDexTxTypes {
  ADD_LIQUIDITY = "Add Liquidity",
  STAKE = "Stake",
  REMOVE_LIQUIDITY = "Remove Liquidity",
  UNSTAKE = "Unstake",
}

export type CantoDexTransactionParams = {
  chainId: number;
  ethAccount: string;
  pair: CantoDexPairWithUserCTokenData;
} & (
  | {
      txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE;
      amountLP: string;
    }
  | {
      txType: CantoDexTxTypes.REMOVE_LIQUIDITY;
      amountLP: string;
      unstake: boolean;
      slippage: number;
      deadline: string;
    }
  | {
      txType: CantoDexTxTypes.ADD_LIQUIDITY;
      amounts: AddLiquidityTxAmounts;
      stake: boolean;
      slippage: number;
      deadline: string;
    }
);

export interface StakeLPParams {
  chainId: number;
  ethAccount: string;
  cLPToken: CTokenWithUserData;
  stake: boolean;
  amount?: string;
}

interface AddLiquidityTxAmounts {
  amount1: string;
  amount2: string;
}
