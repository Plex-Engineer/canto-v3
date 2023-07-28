import { EVMNetwork } from "@/config/interfaces/networks";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const optimismBlockExplorer = "https://goerli-optimism.etherscan.io";

export const OPTIMISM_TESTNET: EVMNetwork = {
  id: "optimism-testnet",
  chainId: 420,
  icon: "https://raw.githubusercontent.com/ethereum-optimism/brand-kit/main/assets/svg/Profile-Logo.svg",
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
};
