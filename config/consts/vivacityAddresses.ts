import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";

const VIVACITY_ADDRESSES = {
  vcNote: {
    mainnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
    testnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
  },
  vcNoteRouter: {
    mainnet: "0xe6a9218c99214196051734642a73A4CA6104d78C",
    testnet: "0xe6a9218c99214196051734642a73A4CA6104d78C",
  },
  market: {
    mainnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
    testnet: "0x74c6dBA944702007e3a18C2caad9F6F274cF38dD",
  },
  lendingLedger: {
    mainnet: "0x85156B45B3C0F40f724637ebfEB035aFB29BD083",
    testnet: "0x94D288543c566Fc20d46A26be9c94Da79ebbcecD",
  },
  gaugeController:{
    mainnet: "0x46970b45d114420A71A3d76AA6c398173118C2b8",
    testnet: "0xc0395538ee9144a2A3acc2C9AD6329bFFe12AF22",
  },
  lendingLedgerRewards: {
    mainnet: "0x8dB102d2089113f6681B216C40c45b84d99E27FF",
    testnet: "0xA5a149a0782573a9404Dda00F9A9aC802261cEc9",
  },
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
