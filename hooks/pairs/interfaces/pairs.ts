import { ERC20Token } from "@/config/interfaces/tokens";

export interface Pair {
  aTob: boolean;
  address: string;
  cDecimals: number;
  cLpAddress: string;
  decimals: number;
  lpPrice: string;
  price1: string;
  price2: string;
  ratio: string;
  reserve1: string;
  reserve2: string;
  stable: boolean;
  symbol: string;
  token1: ERC20Token;
  token2: ERC20Token;
  totalSupply: string;
  tvl: string;
}
