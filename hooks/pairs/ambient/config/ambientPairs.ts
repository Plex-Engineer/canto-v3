import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import { BaseAmbientPair } from "../interfaces/ambientPairs";

const MAINNET_AMBIENT_PAIRS: BaseAmbientPair[] = [
  {
    base: {
      address: "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd",
      chainId: 7700,
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      name: "USDC",
      symbol: "USDC",
    },
    quote: {
      address: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
      chainId: 7700,
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/cNote.svg",
      name: "Collateral Note",
      symbol: "cNote",
    },
    poolIdx: 36000,
    address:
      "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd-0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
    symbol: "cNoteUSDCLP",
    logoURI:
      "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/LP/cNoteUSDCLP.svg",
    stable: true,
  },
];
const TESTNET_AMBIENT_PAIRS: BaseAmbientPair[] = [
  {
    base: {
      address: "0x04E52476d318CdF739C38BD41A922787D441900c",
      chainId: 7701,
      decimals: 18,
      logoURI:
        "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/cNote.svg",
      name: "Collateral Note",
      symbol: "cNote",
    },
    quote: {
      address: "0xc51534568489f47949A828C8e3BF68463bdF3566",
      chainId: 7701,
      decimals: 6,
      logoURI:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      name: "USDC",
      symbol: "USDC",
    },
    poolIdx: 36000,
    address:
      "0x04E52476d318CdF739C38BD41A922787D441900c-0xc51534568489f47949A828C8e3BF68463bdF3566",
    symbol: "cNoteUSDCLP",
    logoURI:
      "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/LP/cNoteUSDCLP.svg",
    stable: true,
  },
];

export function getAmbientPairsFromChainId(chainId: number): BaseAmbientPair[] {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return MAINNET_AMBIENT_PAIRS;
    case CANTO_TESTNET_EVM.chainId:
      return TESTNET_AMBIENT_PAIRS;
    default:
      return [];
  }
}
