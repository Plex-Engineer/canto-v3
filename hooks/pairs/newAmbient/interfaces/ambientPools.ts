export interface BaseAmbientPool {
  address: string; // this address will never be used for transactions, just for identification in hook
  symbol: string;
  logoURI: string;
  base: AmbientPoolToken;
  quote: AmbientPoolToken;
  poolIdx: number;
  stable: boolean;
}
interface AmbientPoolToken {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
  balance?: string;
  isCToken?: boolean;
}

export interface AmbientPool extends BaseAmbientPool {
  stats: {
    latestTime: number;
    baseTvl: string;
    quoteTvl: string;
    baseVolume: string;
    quoteVolume: string;
    baseFees: string;
    quoteFees: string;
    lastPriceSwap: string;
    lastPriceLiq: string;
    lastPriceIndic: string;
    feeRate: number;
  };
  userPositions: AmbientUserPosition[];
  totals: {
    noteTvl: string;
    apr: {
      poolApr: string;
      // each token could have underlying apr from the lending market
      base?: {
        dist: string;
        supply: string;
      };
      quote?: {
        dist: string;
        supply: string;
      };
    };
  };
}
export interface AmbientUserPosition {
  chainId: string;
  base: string;
  quote: string;
  poolIdx: number;
  bidTick: number;
  askTick: number;
  isBid: boolean;
  user: string;
  timeFirstMint: number;
  latestUpdateTime: number;
  lastMintTx: string;
  firstMintTx: string;
  positionType: "concentrated" | "ambient";
  ambientLiq: string;
  concLiq: string;
  rewardLiq: string;
  liqRefreshTime: number;
  aprDuration: number;
  aprPostLiq: string;
  aprContributedLiq: string;
  aprEst: number;
  positionId: string;
}
