import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const avalancheScanUrl = "https://snowtrace.io";

export const AVALANCHE_TESTNET: EVMNetwork = {
  id: "avalanche-testnet",
  chainId: 43113,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.svg",
  name: "Avalanche Testnet",
  isTestChain: true,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  nativeCurrency: {
    name: "AVAX",
    baseName: "wei",
    symbol: "AVAX",
    decimals: 18,
  },
  blockExplorer: {
    url: avalancheScanUrl,
    getAddressLink: getEthAddressLink(avalancheScanUrl),
    getTransactionLink: getEthTransactionLink(avalancheScanUrl),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
