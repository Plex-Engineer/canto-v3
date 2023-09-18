import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const sommelierBlockExplorer = "https://www.mintscan.io/sommelier";

export const SOMMELIER: CosmosNetwork = {
  id: "sommelier-3",
  chainId: "sommelier-3",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.svg",
  name: "Sommelier",
  isTestChain: false,
  rpcUrl: "https://sommelier-rpc.lavenderfive.com",
  restEndpoint: "https://sommelier-api.polkachu.com",
  addressPrefix: "somm",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Sommelier",
    baseName: "usomm",
    symbol: "SOMM",
    decimals: 6,
  },
  blockExplorer: {
    url: sommelierBlockExplorer,
    getAddressLink: getCosmosAddressLink(sommelierBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(sommelierBlockExplorer),
  },
};
