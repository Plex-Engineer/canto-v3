import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const AMBIENT_ADDRESSES = {
  crocQuery: {
    mainnet: "",
    testnet: "0xe950aBb6A77dbA4Ad849bfB6E960e849E022dBb4",
  },
  crocDex: {
    mainnet: "",
    testnet: "0xACB4D5CcFD3291A6b17bE2f117C12A278F57C024",
  },
} as const;

export function getAmbientAddress(
  chainId: number,
  key: keyof typeof AMBIENT_ADDRESSES
): string | null {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return AMBIENT_ADDRESSES[key].mainnet;
    case CANTO_TESTNET_EVM.chainId:
      return AMBIENT_ADDRESSES[key].testnet;
    default:
      return null;
  }
}
