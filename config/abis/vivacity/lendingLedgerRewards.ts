/**
 * lendingLedgerRewards Contract ABI
 */

export const LENDING_LEDGER_REWARDS_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_lendingLedger",
        type: "address",
      },
      {
        internalType: "address",
        name: "_gaugeController",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "WEEK",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_market",
        type: "address",
      },
      {
        internalType: "address",
        name: "_lender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_claimFromTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_claimUpToTimestamp",
        type: "uint256",
      },
    ],
    name: "estimatedRewards",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gaugeController",
    outputs: [
      {
        internalType: "contract IGaugeController",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lendingLedger",
    outputs: [
      {
        internalType: "contract ILendingLedger",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
