import { CToken } from "@/hooks/lending/interfaces/tokens";

export const CANTO_BOT_API_URL = "https://dust.plexnode.org/";
export const CANTO_DATA_API_URL = "https://canto-api-1.plexnode.wtf";
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
  allCTokens: "/v1/lending/ctokens",
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
