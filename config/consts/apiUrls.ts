export const CANTO_BOT_API_URL = "https://dust.plexnode.org/";
export const CANTO_DATA_API_URL = "https://canto-api-1.plexnode.wtf";
export const CANTO_DATA_API_ENDPOINTS = {
  allValidators: "/v1/staking/validators",
  stakingApr: "/v1/staking/apr",
};
export const USER_CANTO_DATA_API_URL = "http://localhost:3000";
export const USER_CANTO_DATA_API_ENDPOINTS = {
  userData: (address: string) => "/v1/user/" + address,
};

export const GRAVITY_BRIDGE_API_URL = "https://info.gravitychain.io:9000";
