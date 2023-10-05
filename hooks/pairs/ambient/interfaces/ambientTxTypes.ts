import { AmbientPair } from "./ambientPairs";

export enum AmbientTxType {
  ADD_CONC_LIQIDITY,
  REMOVE_CONC_LIQUIDITY,
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
