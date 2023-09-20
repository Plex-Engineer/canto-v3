import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const ADDRESS_LIST = {
  mainnet: {
    cNote: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
    // LPS
    cCantoNoteLP: "0x3C96dCfd875253A37acB3D2B102b6f328349b16B",
    cCantoAtomLP: "0xC0D6574b2fe71eED8Cd305df0DA2323237322557",
    cNoteUSDCLP: "0xD6a97e43FC885A83E97d599796458A331E580800",
    cNoteUSDTLP: "0xf0cd6b5cE8A01D1B81F1d8B76643866c5816b49F",
    cCantoETHLP: "0xb49A395B39A0b410675406bEE7bD06330CB503E3",
  },
  testnet: {
    cNote: "0x04E52476d318CdF739C38BD41A922787D441900c",
    // RWAs
    cSYDC: "0xf8892860437674690fC34746d0e93d881d5b96B4",
    // LPS
    cCantoNoteLP: "0x2fd02CDB9Be9428d4eC2Ae969e52710601E219C6",
    cCantoAtomLP: "0x4777Dc2b41f1f2Bd878205A61c1eA2609749928C",
    cNoteUSDCLP: "0xB2C5512a8A70835Cb9aBe830C9e61FBDdcd1dC81",
    cNoteUSDTLP: "0xBeD263484AEDFD449eE1ed8f0b4799192026E190",
    cCantoETHLP: "0xf301c9d5804Fab3dd207ef75f78509db6393f37F",
  },
};

export type CTokenType = "lending" | "lp";
/**
 * @notice gets cToken addresses from chainId
 * @param {number} chainId chainId to get cToken addresses for
 * @param {CTokenType} cTokenType whether to get lending or lp cTokens
 * @returns {string[] | null} cToken addresses or null if not canto chainId
 */
export function getCTokenAddressesFromChainId(
  chainId: number,
  cTokenType: CTokenType
): string[] | null {
  switch (chainId) {
    case CANTO_MAINNET_EVM.chainId:
      return cTokenType === "lending"
        ? [ADDRESS_LIST.mainnet.cNote]
        : cTokenType === "lp"
        ? [
            ADDRESS_LIST.mainnet.cCantoNoteLP,
            ADDRESS_LIST.mainnet.cCantoAtomLP,
            ADDRESS_LIST.mainnet.cNoteUSDCLP,
            ADDRESS_LIST.mainnet.cNoteUSDTLP,
            ADDRESS_LIST.mainnet.cCantoETHLP,
          ]
        : [];
    case CANTO_TESTNET_EVM.chainId:
      return cTokenType === "lending"
        ? [ADDRESS_LIST.testnet.cNote, ADDRESS_LIST.testnet.cSYDC]
        : [
            ADDRESS_LIST.testnet.cCantoNoteLP,
            ADDRESS_LIST.testnet.cCantoAtomLP,
            ADDRESS_LIST.testnet.cNoteUSDCLP,
            ADDRESS_LIST.testnet.cNoteUSDTLP,
            ADDRESS_LIST.testnet.cCantoETHLP,
          ];
    default:
      return null;
  }
}
