import { EVMNetwork } from "@/config/interfaces";
import { getCosmosAddressLink, getCosmosTransactionLink } from "../helpers";

const gravityBridgeBlockExplorer = "https://www.mintscan.io/gravity-bridge";

export const GRAVITY_BRIGDE_EVM: EVMNetwork = {
  id: "gravity-bridge-evm",
  chainId: 999999,
  icon: "/icons/grav.svg",
  name: "Gravity Bridge",
  isTestChain: false,
  rpcUrl: "https://info.gravitychain.io:8545",
  nativeCurrency: {
    name: "Graviton",
    baseName: "ugraviton",
    symbol: "GRAV",
    decimals: 18,
  },
  blockExplorer: {
    url: gravityBridgeBlockExplorer,
    getAddressLink: getCosmosAddressLink(gravityBridgeBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(gravityBridgeBlockExplorer),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
