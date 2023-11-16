import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const C_TOKEN_ADDRESSES_BY_TYPE = {
  mainnet: {
    cNote: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
    rwas: ["0x0355E393cF0cf5486D9CAefB64407b7B1033C2f1"], //cSDYC
    stableCoins: [
      "0xdE59F060D7ee2b612E7360E6C1B97c4d8289Ca2e", //cUSDC
      "0x6b46ba92d7e94FfA658698764f5b8dfD537315A9", //cUSDT
    ],
    lps: [
      "0x3C96dCfd875253A37acB3D2B102b6f328349b16B", //cCantoNoteLP
      "0xC0D6574b2fe71eED8Cd305df0DA2323237322557", //cCantoAtomLP
      "0xD6a97e43FC885A83E97d599796458A331E580800", //cNoteUSDCLP
      "0xf0cd6b5cE8A01D1B81F1d8B76643866c5816b49F", //cNoteUSDTLP
      "0xb49A395B39A0b410675406bEE7bD06330CB503E3", //cCantoETHLP
    ],
  },
  testnet: {
    cNote: "0x04E52476d318CdF739C38BD41A922787D441900c",
    rwas: ["0xf8892860437674690fC34746d0e93d881d5b96B4"], //cSDYC
    stableCoins: [
      "0x9160c5760a540cAfA24F90102cAA14C50497d5b7", //cUSDC
      "0x3BEe0A8209e6F8c5c743F21e0cA99F2cb780D0D8", //cUSDT
    ],
    lps: [
      "0x2fd02CDB9Be9428d4eC2Ae969e52710601E219C6", //cCantoNoteLP
      "0x4777Dc2b41f1f2Bd878205A61c1eA2609749928C", //cCantoAtomLP
      "0xB2C5512a8A70835Cb9aBe830C9e61FBDdcd1dC81", //cNoteUSDCLP
      "0xBeD263484AEDFD449eE1ed8f0b4799192026E190", //cNoteUSDTLP
      "0xf301c9d5804Fab3dd207ef75f78509db6393f37F", //cCantoETHLP
    ],
  },
} as const;

// lending will include cNote, cRWAs, cStableCoins
export type LendingMarketType = "lending" | "lp";
/**
 * @notice gets cToken addresses from chainId
 * @param {number} chainId chainId to get cToken addresses for
 * @param {LendingMarketType} lmType whether to get lending or lp cTokens
 * @returns {string[] | null} cToken addresses or null if not canto chainId
 */
export function getCTokenAddressesFromChainId(
  chainId: number,
  lmType: LendingMarketType
): string[] | null {
  switch (lmType) {
    case "lending":
      const cNote = getCTokensFromType(chainId, "cNote");
      const rwaList = getCTokensFromType(chainId, "rwas");
      const stableCoins = getCTokensFromType(chainId, "stableCoins");
      if (cNote && rwaList && stableCoins)
        return [...rwaList, cNote, ...stableCoins];
      return null;
    case "lp":
      return getCTokensFromType(chainId, "lps");
    default:
      return null;
  }
}

// will get exact list of cTokens from type and chainId
type CTokenAddressesByType = keyof typeof C_TOKEN_ADDRESSES_BY_TYPE.mainnet;
export function getCTokensFromType(
  chainId: number,
  type: "cNote"
): string | null;
export function getCTokensFromType(
  chainId: number,
  type: "rwas" | "lps" | "stableCoins"
): string[] | null;

/**
 * @notice gets cToken addresses from type and chainId
 * @param {number} chainId chainId to get cToken addresses for
 * @param {CTokenAddressesByType} type whether to get cNote, rwas, or lps
 * @returns {string[] | string | null} cToken addresses or null if not canto chainId
 */
export function getCTokensFromType(
  chainId: number,
  type: CTokenAddressesByType
): readonly string[] | string | null {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return C_TOKEN_ADDRESSES_BY_TYPE.mainnet[type];
    case CANTO_TESTNET_EVM.chainId:
      return C_TOKEN_ADDRESSES_BY_TYPE.testnet[type];
    default:
      return null;
  }
}
