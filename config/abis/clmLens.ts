/**
 * CLM LENS CONTRACT ABI
 */
export const CLM_LENS_ABI = [
  {
    inputs: [
      {
        internalType: "contract ComptrollerLensInterface",
        name: "comptroller",
        type: "address",
      },
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "account",
        type: "address",
      },
    ],
    name: "cTokenBalances",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cTokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "balanceOfCToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "balanceOfUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewards",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isCollateral",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "supplyBalanceInUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingAllowance",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenBalances",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ComptrollerLensInterface",
        name: "comptroller",
        type: "address",
      },
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
      {
        internalType: "address payable",
        name: "account",
        type: "address",
      },
    ],
    name: "cTokenBalancesAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cTokenAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "balanceOfCToken",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "balanceOfUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "rewards",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isCollateral",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "supplyBalanceInUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingAllowance",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenBalances[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
    ],
    name: "cTokenMetadata",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "exchangeRateCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrows",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalReserves",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalCash",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isListed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "collateralFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "underlyingAssetAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "cTokenDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "compSupplySpeed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "compBorrowSpeed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowCap",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
    ],
    name: "cTokenMetadataAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "exchangeRateCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrows",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalReserves",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalCash",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isListed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "collateralFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "underlyingAssetAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "cTokenDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "compSupplySpeed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "compBorrowSpeed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowCap",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenMetadata[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
    ],
    name: "cTokenUnderlyingPrice",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "underlyingPrice",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenUnderlyingPrice",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
    ],
    name: "cTokenUnderlyingPriceAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "underlyingPrice",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.CTokenUnderlyingPrice[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ComptrollerLensInterface",
        name: "comptroller",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAccountLimits",
    outputs: [
      {
        components: [
          {
            internalType: "contract CToken[]",
            name: "markets",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shortfall",
            type: "uint256",
          },
        ],
        internalType: "struct CantoLens.AccountLimits",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
