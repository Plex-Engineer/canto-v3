import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const polygonScanUrl = "https://mumbai.polygonscan.com";

export const MUMBAI_TESTNET: EVMNetwork = {
  id: "mumbai-testnet",
  chainId: 80001,
  icon: "/icons/matic.svg",
  name: "Mumbai Testnet",
  isTestChain: true,
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  nativeCurrency: {
    name: "MATIC",
    baseName: "wei",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorer: {
    url: polygonScanUrl,
    getAddressLink: getEthAddressLink(polygonScanUrl),
    getTransactionLink: getEthTransactionLink(polygonScanUrl),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
