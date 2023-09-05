export interface CToken {
  address: string;
  borrowApy: string;
  borrowCap: string;
  cash: string;
  collateralFactor: string;
  decimals: number;
  distApy: string;
  exchangeRate: string;
  isListed: boolean;
  liquidity: string;
  name: string;
  price: string;
  supplyApy: string;
  symbol: string;
  underlying: {
    address: string;
    decimals: number;
    name: string;
    symbol: string;
  };
}
export interface FormattedCToken extends CToken {
  userDetails?: {
    balanceOfCToken: string;
    balanceOfUnderlying: string;
    borrowBalance: string;
    compSupplierIndex: string;
    isCollateral: boolean;
    routerAllowanceCToken: string;
    routerAllowanceUnderlying: string;
  };
}
