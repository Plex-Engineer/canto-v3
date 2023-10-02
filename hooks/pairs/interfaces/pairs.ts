import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";

export interface Pair {
  aTob: boolean;
  address: string;
  cDecimals: number;
  cLpAddress: string;
  decimals: number;
  logoURI: string;
  lpPrice: string;
  price1: string;
  price2: string;
  ratio: string;
  reserve1: string;
  reserve2: string;
  stable: boolean;
  symbol: string;
  token1: PairToken;
  token2: PairToken;
  totalSupply: string;
  tvl: string;
}

interface PairToken {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  balance?: string;
}

// will include balances, staked, and allowances
export interface PairWithUserCTokenData extends Pair {
  clmData?: CTokenWithUserData;
}
