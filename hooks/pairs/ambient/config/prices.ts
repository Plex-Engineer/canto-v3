import { CANTO_TESTNET_EVM } from "@/config/networks";

// AMBIENT PRICE AND TICK DEFAULTS
const DEFAULT_TESTNET_AMBIENT_TICKS = {
  minTick: 276322 - 800,
  maxTick: 276322 + 800,
};
const DEFAULT_MAINNET_AMBIENT_TICKS = {
  minTick: -276325 - 75,
  maxTick: -276325 + 75,
};
export function getDefaultTickRangeFromChainId(chainId: number) {
  if (chainId === CANTO_TESTNET_EVM.chainId) {
    return DEFAULT_TESTNET_AMBIENT_TICKS;
  }
  return DEFAULT_MAINNET_AMBIENT_TICKS;
}
