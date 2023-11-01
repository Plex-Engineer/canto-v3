import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const optimismBlockExplorer = "https://goerli-optimism.etherscan.io";

export const OPTIMISM_TESTNET: EVMNetwork = {
  id: "optimism-testnet",
  chainId: 420,
  icon: "/icons/op.svg",
  name: "Optimism Testnet",
  isTestChain: true,
  rpcUrl: "https://goerli.optimism.io",
  nativeCurrency: {
    name: "ETH",
    baseName: "wei",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorer: {
    url: optimismBlockExplorer,
    getAddressLink: getEthAddressLink(optimismBlockExplorer),
    getTransactionLink: getEthTransactionLink(optimismBlockExplorer),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
