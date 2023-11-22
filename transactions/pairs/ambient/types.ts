import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";

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
  minExecPriceWei: string;
  maxExecPriceWei: string;
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

export type AmbientClaimRewardsTxParams = {
  chainId: number;
  ethAccount: string;
  estimatedRewards: string; // estimation before distribution of rewards, only used for drip purposes (all rewards will be claimed)
};
