import { EVMNetwork } from "@/config/interfaces/networks";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const fantomScanUrl = "https://ftmscan.com";

export const FANTOM_TESTNET: EVMNetwork = {
  id: "fantom-testnet",
  chainId: 4002,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.svg",
  name: "Fantom Testnet",
  isTestChain: true,
  rpcUrl: "https://rpc.testnet.fantom.network",
  nativeCurrency: {
    name: "Fantom",
    baseName: "wei",
    symbol: "FTM",
    decimals: 18,
  },
  blockExplorer: {
    url: fantomScanUrl,
    getAddressLink: getEthAddressLink(fantomScanUrl),
    getTransactionLink: getEthTransactionLink(fantomScanUrl),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
