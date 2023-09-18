import { CToken } from "@/hooks/lending/interfaces/tokens";

export const CANTO_BOT_API_URL = "https://dust.plexnode.org/";
export const CANTO_DATA_API_URL = "http://localhost:8010/proxy";
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
  allCTokens: "/v1/lending/ctokens",
  allPairs: "/v1/dex/pairs",
};
// interfaces for responses
export interface GeneralCTokenResponse {
  blockNumber: string;
  cTokens: CToken[];
}

export const USER_CANTO_DATA_API_URL = "http://localhost:3001";
export const USER_CANTO_DATA_API_ENDPOINTS = {
  userData: (address: string) => "/v1/user/" + address,
};
// interface for response
export interface UserDataResponse {
  account: string;
  blockNumber: string;
  user: {
    lending: {
      cToken: {
        [key: string]: {
          balanceOfCToken: string[];
          balanceOfUnderlying: string[];
          borrowBalance: string[];
          compSupplierIndex: string[];
          isCollateral: boolean[];
          routerAllowanceCToken: string[];
          routerAllowanceUnderlying: string[];
        };
      };
      liquidity: string[3];
    };
  };
}

export const GRAVITY_BRIDGE_API_URL = "https://info.gravitychain.io:9000";
export const SLINGSHOT_API_URL = "https://slingshot.finance/api/v3";

export interface GeneralPairResponse {
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
  token1: PairToken;
  token2: PairToken;
  totalSupply: string;
  tvl: string;
}
interface PairToken {
  address: string;
  chainId: string;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
}
