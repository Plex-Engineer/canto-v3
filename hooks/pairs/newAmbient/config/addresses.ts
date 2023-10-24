import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const AMBIENT_ADDRESSES = {
  crocQuery: {
    mainnet: "0xfDf5Ed2D354e05cF292808CF94Bd5c972D842D09",
    testnet: "0x644762D1F81Fa71Dc36d9041bc6d66879c6BAD2e",
  },
  crocDex: {
    mainnet: "0x9290c893ce949fe13ef3355660d07de0fb793618",
    testnet: "0xd9bac85f6ac9fBFd2559A4Ac2883c635C29Feb4b",
  },
  rewardLedger: {
    mainnet: "0x00325777c82C1E3E4B22208Bc1C769f19B2B67Ba",
    testnet: "0x6f5985723EBF98d4A200845C680a7e33bD183a80",
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
