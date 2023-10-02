import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const cosmosHubBlockExplorer = "https://www.mintscan.io/cosmos";

export const COSMOS_HUB: CosmosNetwork = {
  id: "cosmoshub-4",
  chainId: "cosmoshub-4",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
  name: "Cosmos Hub",
  isTestChain: false,
  rpcUrl: "https://rpc-cosmoshub.blockapsis.com",
  restEndpoint: "https://api-cosmoshub-ia.cosmosia.notional.ventures",
  addressPrefix: "cosmos",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Atom",
    baseName: "uatom",
    symbol: "ATOM",
    decimals: 6,
  },
  blockExplorer: {
    url: cosmosHubBlockExplorer,
    getAddressLink: getCosmosAddressLink(cosmosHubBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(cosmosHubBlockExplorer),
  },
};
