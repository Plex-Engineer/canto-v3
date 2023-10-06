export interface BaseAmbientPair {
  address: string; // this address will never be used for transactions, just for identification in hook
  symbol: string;
  logoURI: string;
  base: AmbientPairToken;
  quote: AmbientPairToken;
  poolIdx: number;
}

export interface AmbientPair extends BaseAmbientPair {
  q64PriceRoot: string; // price of base in quote in q64 root format
  currentTick: number; // current tick of curve
  concLiquidity: string; // concentrated liquidity
  liquidity: {
    base: string;
    quote: string;
    rootLiquidity: string;
  };
  userDetails?: AmbientUserDetails;
}

interface AmbientUserDetails {
  liquidity: UserPosition[];
  defaultRangePosition: UserPosition;
}

interface UserPosition {
  lowerTick: number;
  upperTick: number;
  liquidity: string;
}

interface AmbientPairToken {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  balance?: string;
}
