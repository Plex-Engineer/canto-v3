export const AMBIENT_REWARD_LEDGER_ABI = [
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "uint256", name: "rewards", internalType: "uint256" }],
    name: "getUnclaimedRewards",
    inputs: [{ type: "address", name: "user", internalType: "address" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    name: "claimRwards",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
  },
] as const;
