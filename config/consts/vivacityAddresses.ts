import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const VIVACITY_ADDRESSES = {
  vcNote :{
    mainnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
    testnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
  },
  vcNoteRouter :{
    mainnet: "0xe6a9218c99214196051734642a73A4CA6104d78C",
    testnet: "0xe6a9218c99214196051734642a73A4CA6104d78C",
  }
} as const;

type ContractName = keyof typeof VIVACITY_ADDRESSES;
// canto chain types
type ChainType = "mainnet" | "testnet";
export function getVivacityAddress(
  chainId: number,
  contractName: ContractName
): `0x${string}` | null {
  // make sure on canto chain id
  let chainType: ChainType;
  if (chainId === CANTO_MAINNET_EVM.chainId) chainType = "mainnet";
  else if (chainId === CANTO_TESTNET_EVM.chainId) chainType = "testnet";
  else return null;
  return VIVACITY_ADDRESSES[contractName][chainType];
}