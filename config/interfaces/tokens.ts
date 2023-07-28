export interface ERC20Token {
  id: string; // unique id (address is fine)
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}
