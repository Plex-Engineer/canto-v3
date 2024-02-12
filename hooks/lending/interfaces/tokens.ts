export interface CToken {
  address: string;
  borrowApy: string;
  borrowApr: string;
  borrowCap: string;
  cash: string;
  collateralFactor: string;
  compSupplyState: string;
  decimals: number;
  distApy: string;
  distApr: string;
  exchangeRate: string;
  isListed: boolean;
  liquidity: string;
  name: string;
  price: string;
  supplyApy: string;
  supplyApr: string;
  symbol: string;
  underlying: {
    address: string;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
  };
  underlyingTotalSupply: string;
}
export interface UserCTokenDetails {
  chainId: number;
  cTokenAddress: string;
  balanceOfCToken: string;
  balanceOfUnderlying: string;
  borrowBalance: string;
  rewards: string;
  isCollateral: boolean;
  supplyBalanceInUnderlying: string;
  underlyingAllowance: string;
}

export interface CTokenWithUserData extends CToken {
  userDetails?: UserCTokenDetails;
}
