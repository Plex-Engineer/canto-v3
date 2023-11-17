import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";

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
      slippage: number;
      deadline: string;
    }
  | {
      txType: CantoDexTxTypes.ADD_LIQUIDITY;
      amounts: {
        amount1: string;
        amount2: string;
      };
      stake: boolean;
      slippage: number;
      deadline: string;
    }
);
