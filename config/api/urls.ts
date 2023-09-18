export const CANTO_DUST_BOT_API_URL = "https://dust.plexnode.org/";
export const GRAVITY_BRIDGE_API_URL = "https://info.gravitychain.io:9000";
export const SLINGSHOT_API_URL = "https://slingshot.finance/api/v3";

// canto api
const cantoDataBaseUrl = "http://localhost:8010/proxy";
export const CANTO_DATA_API = {
  allValidators: cantoDataBaseUrl + "/v1/staking/validators",
  stakingApr: cantoDataBaseUrl + "/v1/staking/apr",
  allCTokens: cantoDataBaseUrl + "/v1/lending/ctokens",
};
