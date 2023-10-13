import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const persistenceBlockExplorer = "https://www.mintscan.io/persistence";

export const PERSISTENCE: CosmosNetwork = {
  id: "core-1",
  chainId: "core-1",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
  name: "Persistence",
  isTestChain: false,
  rpcUrl: "https://rpc.core.persistence.one",
  restEndpoint: "https://rest.core.persistence.one",
  addressPrefix: "persistence",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Persistence",
    baseName: "uxprt",
    symbol: "XPRT",
    decimals: 6,
  },
  blockExplorer: {
    url: persistenceBlockExplorer,
    getAddressLink: getCosmosAddressLink(persistenceBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(persistenceBlockExplorer),
  },
};
