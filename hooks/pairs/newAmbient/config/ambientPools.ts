import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import { BaseAmbientPool } from "../interfaces/ambientPools";

const MAINNET_AMBIENT_POOLS: BaseAmbientPool[] = [
  {
    base: {
      address: "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd",
      chainId: 7700,
      decimals: 6,
      logoURI: "/icons/usdc.svg",
      name: "USDC",
      symbol: "USDC",
    },
    quote: {
      address: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
      chainId: 7700,
      decimals: 18,
      logoURI: "/icons/cNote.svg",
      name: "Collateral Note",
      symbol: "cNote",
      isCToken: true,
    },
    poolIdx: 36000,
    address:
      "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd-0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
    symbol: "cNOTE / USDC",
    logoURI: "/icons/cNoteUSDCLP.svg",
    stable: true,
    rewardsLedger: "0x00325777c82C1E3E4B22208Bc1C769f19B2B67Ba",
  },
  {
    base: {
      address: "0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503",
      chainId: 7700,
      decimals: 18,
      logoURI: "/icons/note.svg",
      name: "Note",
      symbol: "NOTE",
    },
    quote: {
      address: "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd",
      chainId: 7700,
      decimals: 6,
      logoURI: "/icons/usdc.svg",
      name: "USDC",
      symbol: "USDC",
    },
    poolIdx: 36000,
    address:
      "0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503-0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd",
    symbol: "NOTE / USDC",
    logoURI:
      "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/LP/NoteUSDCLP.svg",
    stable: true,
    rewardsLedger: "0x554209512B8d1148eBA7D91cCabf3ea7C790c042",
  },
];
const TESTNET_AMBIENT_POOLS: BaseAmbientPool[] = [
  {
    base: {
      address: "0x04E52476d318CdF739C38BD41A922787D441900c",
      chainId: 7701,
      decimals: 18,
      logoURI: "/icons/cNote.svg",
      name: "Collateral Note",
      symbol: "cNote",
    },
    quote: {
      address: "0xc51534568489f47949A828C8e3BF68463bdF3566",
      chainId: 7701,
      decimals: 6,
      logoURI: "/icons/usdc.svg",
      name: "USDC",
      symbol: "USDC",
    },
    poolIdx: 36000,
    address:
      "0x04E52476d318CdF739C38BD41A922787D441900c-0xc51534568489f47949A828C8e3BF68463bdF3566",
    symbol: "cNoteUSDCLP",
    logoURI: "/icons/cNoteUSDCLP.svg",
    stable: true,
    rewardsLedger: "0x6f5985723EBF98d4A200845C680a7e33bD183a80",
  },
];

export function getAmbientPoolsFromChainId(chainId: number): BaseAmbientPool[] {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return MAINNET_AMBIENT_POOLS;
    case CANTO_TESTNET_EVM.chainId:
      return TESTNET_AMBIENT_POOLS;
    default:
      return [];
  }
}
