import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const C_TOKEN_ADDRESSES_BY_TYPE = {
  mainnet: {
    cNote: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
    rwas: ["0x0355E393cF0cf5486D9CAefB64407b7B1033C2f1"],
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
    rwas: ["0xf8892860437674690fC34746d0e93d881d5b96B4"], //cSYDC
    lps: [
      "0x2fd02CDB9Be9428d4eC2Ae969e52710601E219C6", //cCantoNoteLP
      "0x4777Dc2b41f1f2Bd878205A61c1eA2609749928C", //cCantoAtomLP
      "0xB2C5512a8A70835Cb9aBe830C9e61FBDdcd1dC81", //cNoteUSDCLP
      "0xBeD263484AEDFD449eE1ed8f0b4799192026E190", //cNoteUSDTLP
      "0xf301c9d5804Fab3dd207ef75f78509db6393f37F", //cCantoETHLP
    ],
  },
};

// lending will include cNote and cRWAs
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
      if (cNote && rwaList) return [...rwaList, cNote];
      return null;
    case "lp":
      return getCTokensFromType(chainId, "lps");
    default:
      return null;
  }
}

// will get exact list of cTokens from type and chainId
type CTokenAddressesByType = "cNote" | "rwas" | "lps";
export function getCTokensFromType(
  chainId: number,
  type: "cNote"
): string | null;
export function getCTokensFromType(
  chainId: number,
  type: "rwas" | "lps"
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
): string[] | string | null {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return C_TOKEN_ADDRESSES_BY_TYPE.mainnet[type];
    case CANTO_TESTNET_EVM.chainId:
      return C_TOKEN_ADDRESSES_BY_TYPE.testnet[type];
    default:
      return null;
  }
}
