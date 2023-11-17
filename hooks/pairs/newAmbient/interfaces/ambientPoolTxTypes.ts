import { AmbientPool } from "./ambientPools";

export enum AmbientTxType {
  ADD_CONC_LIQUIDITY = "Add concentrated liquidity",
  REMOVE_CONC_LIQUIDITY = "Remove concentrated liquidity",
}
export type AmbientTransactionParams = {
  chainId: number;
  ethAccount: string;
} & (
  | AmbientAddConcentratedLiquidityParams
  | AmbientRemoveConcentratedLiquidityParams
);

type BaseConcLiqParams = {
  txType: AmbientTxType;
  pool: AmbientPool;
  lowerTick: number;
  upperTick: number;
  minPriceWei: string;
  maxPriceWei: string;
};
export type AmbientAddConcentratedLiquidityParams = BaseConcLiqParams & {
  txType: AmbientTxType.ADD_CONC_LIQUIDITY;
  amount: string;
  isAmountBase: boolean;
  positionId?: string;
};
export type AmbientRemoveConcentratedLiquidityParams = BaseConcLiqParams & {
  txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
  liquidity: string;
  positionId: string;
};
