import { AmbientPair } from "./ambientPairs";

export enum AmbientTxType {
  ADD_CONC_LIQUIDITY = "Add concentrated liquidity",
  REMOVE_CONC_LIQUIDITY = "Remove concentrated liquidity",
}
export type AmbientTransactionParams = {
  chainId: number;
  ethAccount: string;
  pair: AmbientPair;
  lowerTick: number;
  upperTick: number;
} & (
  | {
      txType: AmbientTxType.ADD_CONC_LIQUIDITY;
      amount: string;
      isAmountBase: boolean;
    }
  | {
      txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
      liquidity: string;
    }
);
