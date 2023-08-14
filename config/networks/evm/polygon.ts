import { EVMNetwork } from "@/config/interfaces/networks";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const polygonScanUrl = "https://polygonscan.com";

export const MUMBAI_TESTNET: EVMNetwork = {
  id: "mumbai-testnet",
  chainId: 80001,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.svg",
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
};
