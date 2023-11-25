import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

export const GRAVITY_BRIGDE_EVM: EVMNetwork = {
  id: "gravity-bridge-evm",
  chainId: 999999,
  icon: "/icons/grav.svg",
  name: "Gravity Bridge",
  isTestChain: false,
  rpcUrl: "http://localhost:8545",
  nativeCurrency: {
    name: "Graviton",
    baseName: "ugraviton",
    symbol: "GRAV",
    decimals: 6,
  },
  blockExplorer: {
    url: "",
    getAddressLink: getEthAddressLink(""),
    getTransactionLink: getEthTransactionLink(""),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
