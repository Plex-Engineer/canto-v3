import { CANTO_TESTNET_EVM } from "@/config/networks";

// AMBIENT PRICE AND TICK DEFAULTS
const DEFAULT_TESTNET_AMBIENT_TICKS = {
  narrow: {
    lowerTick: 276322 - 800,
    upperTick: 276322 + 800,
  },
  wide: {
    lowerTick: 276322 - 1600,
    upperTick: 276322 + 1600,
  },
};
const DEFAULT_MAINNET_AMBIENT_TICKS = {
  narrow: {
    lowerTick: -276325 - 75,
    upperTick: -276325 + 75,
  },
  wide: {
    lowerTick: -276325 - 100,
    upperTick: -276325 + 100,
  },
};
export function getDefaultTickRangeFromChainId(chainId: number) {
  if (chainId === CANTO_TESTNET_EVM.chainId) {
    return DEFAULT_TESTNET_AMBIENT_TICKS;
  }
  return DEFAULT_MAINNET_AMBIENT_TICKS;
}
