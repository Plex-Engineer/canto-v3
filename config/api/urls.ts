export const CANTO_DUST_BOT_API_URL = "https://dust.plexnode.org/";
export const GRAVITY_BRIDGE_API_URL = "https://info.gravitychain.io:9000";
export const SLINGSHOT_API_URL = "https://slingshot.finance/api/v3";

// canto api
const cantoMainnetDataBaseUrl = "http://localhost:8010/proxy";
const cantoTestnetDataBaseUrl = "http://localhost:3001";
export const CANTO_DATA_BASE_URL = (chainId: number) => {
  return chainId === 7701 ? cantoTestnetDataBaseUrl : cantoMainnetDataBaseUrl;
};
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
  allCTokens: "/v1/lending/cTokens",
  allPairs: "/v1/dex/pairs",
};
