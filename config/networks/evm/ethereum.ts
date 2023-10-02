import { EVMNetwork } from "@/config/interfaces";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const ethBlockExplorer = "https://etherscan.io";
const goerliBlockExplorer = "https://goerli.etherscan.io";

export const ETH_MAINNET: EVMNetwork = {
  id: "eth-mainnet",
  chainId: 1,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg",
  name: "Ethereum",
  isTestChain: false,
  rpcUrl:
    "https://eth-mainnet.g.alchemy.com/v2/2E-MkpCCzLi7h3Ekoin022kM8Zz1ek8F",
  nativeCurrency: {
    name: "Ethereum",
    baseName: "wei",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorer: {
    url: ethBlockExplorer,
    getAddressLink: getEthAddressLink(ethBlockExplorer),
    getTransactionLink: getEthTransactionLink(ethBlockExplorer),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};

export const GOERLI_TESTNET: EVMNetwork = {
  id: "goerli-testnet",
  chainId: 5,
  icon: "",
  name: "Goerli Testnet",
  isTestChain: true,
  rpcUrl: "https://rpc.ankr.com/eth_goerli",
  nativeCurrency: {
    name: "ETH",
    baseName: "wei",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorer: {
    url: goerliBlockExplorer,
    getAddressLink: getEthAddressLink(goerliBlockExplorer),
    getTransactionLink: getEthTransactionLink(goerliBlockExplorer),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};
