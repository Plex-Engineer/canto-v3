import { AmbientPair } from "./ambientPairs";

export enum AmbientTxType {
  ADD_CONC_LIQIDITY = "Add concentrated liquidity",
  REMOVE_CONC_LIQUIDITY = "Remove concentrated liquidity",
}
export type AmbientTransactionParams = {
  chainId: number;
  ethAccount: string;
  pair: AmbientPair;
  minPrice: string;
  maxPrice: string;
} & {
  txType: AmbientTxType.ADD_CONC_LIQIDITY;
  amount: string;
  isAmountBase: boolean;
};
