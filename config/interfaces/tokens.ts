export interface ERC20Token {
  id: string; // unique id (address is fine)
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  balance?: string;
  nativeWrappedToken?: boolean; // if this is a wrapper around the network native token (chainId)
}

// extends ERC20 since all IBC tokens supported on Canto will have
// an ERC20 representation
export interface IBCToken extends Omit<ERC20Token, "address"> {
  address?: string;
  ibcDenom: string; // "ibc/..."
  nativeName: string; // ex. uatom, ucre, acanto
}

// OFT is an ERC20 but it may be a proxy to another token (native, or another ERC20)
export interface OFTToken extends ERC20Token {
  isOFT: true;
  isOFTProxy: boolean;
  oftUnderlyingAddress?: string; // if proxy is true and this is undefined, then it is a proxy to the native token
}
