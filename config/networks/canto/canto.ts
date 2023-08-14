import { BaseNetwork } from "@/config/interfaces/networks";
import { getEthAddressLink, getEthTransactionLink } from "../helpers";

const cantoBlockExplorer = "https://tuber.build";
const cantoTestnetBlockExplorer = "https://testnet.tuber.build";

export const CANTO_MAINNET: BaseNetwork = {
  id: "canto-mainnet",
  chainId: 7700,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
  name: "Canto",
  isTestChain: false,
  rpcUrl: "https://mainnode.plexnode.org:8545",
  nativeCurrency: {
    name: "Canto",
    baseName: "acanto",
    symbol: "CANTO",
    decimals: 18,
  },
  blockExplorer: {
    url: cantoBlockExplorer,
    getAddressLink: getEthAddressLink(cantoBlockExplorer),
    getTransactionLink: getEthTransactionLink(cantoBlockExplorer),
  },
};

export const CANTO_TESTNET: BaseNetwork = {
  id: "canto-testnet",
  chainId: 7701,
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
  name: "Canto Testnet",
  isTestChain: true,
  rpcUrl: "https://canto-testnet.plexnode.wtf",
  nativeCurrency: {
    name: "Canto",
    baseName: "acanto",
    symbol: "CANTO",
    decimals: 18,
  },
  blockExplorer: {
    url: cantoTestnetBlockExplorer,
    getAddressLink: getEthAddressLink(cantoTestnetBlockExplorer),
    getTransactionLink: getEthTransactionLink(cantoTestnetBlockExplorer),
  },
};
