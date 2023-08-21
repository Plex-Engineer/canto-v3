import {
  BaseNetwork,
  CosmosNetwork,
  EVMNetwork,
} from "@/config/interfaces/networks";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
  getEthAddressLink,
  getEthTransactionLink,
} from "../helpers";

const cantoBlockExplorerEVM = "https://tuber.build";
const cantoTestnetBlockExplorerEVM = "https://testnet.tuber.build";

const cantoBlockExplorerCosmos = "https://www.mintscan.io/canto";

// canto will have an EVM and COSMOS chain data
const cantoMainnetBaseInfo = {
  name: "Canto",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
  isTestChain: false,
  rpcUrl: "https://mainnode.plexnode.org:8545",
  nativeCurrency: {
    name: "Canto",
    baseName: "acanto",
    symbol: "CANTO",
    decimals: 18,
  },
};

export const CANTO_MAINNET_EVM: EVMNetwork = {
  ...cantoMainnetBaseInfo,
  id: "canto-mainnet",
  chainId: 7700,
  blockExplorer: {
    url: cantoBlockExplorerEVM,
    getAddressLink: getEthAddressLink(cantoBlockExplorerEVM),
    getTransactionLink: getEthTransactionLink(cantoBlockExplorerEVM),
  },
  multicall3Address: "0xcA11bde05977b3631167028862bE2a173976CA11",
};

export const CANTO_MAINNET_COSMOS: CosmosNetwork = {
  ...cantoMainnetBaseInfo,
  id: "canto_7700-1",
  chainId: "canto_7700-1",
  restEndpoint: "https://mainnode.plexnode.org:1317",
  addressPrefix: "canto",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  blockExplorer: {
    url: cantoBlockExplorerCosmos,
    getAddressLink: getCosmosAddressLink(cantoBlockExplorerCosmos),
    getTransactionLink: getCosmosTransactionLink(cantoBlockExplorerCosmos),
  },
};

// Testnet
const cantoTestnetBaseInfo = {
  name: "Canto Testnet",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
  isTestChain: true,
  rpcUrl: "https://canto-testnet.plexnode.wtf",
  nativeCurrency: {
    name: "Canto",
    baseName: "acanto",
    symbol: "CANTO",
    decimals: 18,
  },
};
export const CANTO_TESTNET_EVM: EVMNetwork = {
  ...cantoTestnetBaseInfo,
  id: "canto-testnet",
  chainId: 7701,
  blockExplorer: {
    url: cantoTestnetBlockExplorerEVM,
    getAddressLink: getEthAddressLink(cantoTestnetBlockExplorerEVM),
    getTransactionLink: getEthTransactionLink(cantoTestnetBlockExplorerEVM),
  },
};

export const CANTO_TESTNET_COSMOS: CosmosNetwork = {
  ...cantoTestnetBaseInfo,
  id: "canto_7701-1",
  chainId: "canto_7701-1",
  restEndpoint: "https://api-testnet.plexnode.wtf",
  addressPrefix: "canto",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  blockExplorer: {
    url: cantoBlockExplorerCosmos,
    getAddressLink: getCosmosAddressLink(cantoBlockExplorerCosmos),
    getTransactionLink: getCosmosTransactionLink(cantoBlockExplorerCosmos),
  },
};
