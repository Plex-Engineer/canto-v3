import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const AMBIENT_ADDRESSES = {
  crocQuery: {
    mainnet: "",
    testnet: "0x644762D1F81Fa71Dc36d9041bc6d66879c6BAD2e",
  },
  crocDex: {
    mainnet: "",
    testnet: "0xd9bac85f6ac9fBFd2559A4Ac2883c635C29Feb4b",
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
