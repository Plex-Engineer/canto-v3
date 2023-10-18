import { AmbientPool } from "./ambientPools";

export enum AmbientTxType {
  ADD_CONC_LIQUIDITY = "Add concentrated liquidity",
  REMOVE_CONC_LIQUIDITY = "Remove concentrated liquidity",
}
export type AmbientTransactionParams = {
  chainId: number;
  ethAccount: string;
  pair: AmbientPool;
  lowerTick: number;
  upperTick: number;
  minPriceWei: string;
  maxPriceWei: string;
} & (
  | {
      txType: AmbientTxType.ADD_CONC_LIQUIDITY;
      amount: string;
      isAmountBase: boolean;
      positionId?: string;
    }
  | {
      txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
      liquidity: string;
      positionId: string;
    }
);
