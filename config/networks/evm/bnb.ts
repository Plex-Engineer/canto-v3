import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const bscExplorerUrl = "https://bscscan.com";
export const BNB_MAINNET: EVMNetwork = {
  id: "bnb-mainnet",
  chainId: 56,
  icon: "/icons/bnb.svg",
  name: "BNB",
  isTestChain: false,
  rpcUrl: "https://bsc-dataseed1.binance.org",
  nativeCurrency: {
    name: "BNB",
    baseName: "wei",
    symbol: "BNB",
    decimals: 18,
  },
  blockExplorer: {
    url: bscExplorerUrl,
    getAddressLink: getEthAddressLink(bscExplorerUrl),
    getTransactionLink: getEthTransactionLink(bscExplorerUrl),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
