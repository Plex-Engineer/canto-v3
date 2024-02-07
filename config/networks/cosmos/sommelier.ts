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
  icon: "/icons/somm.svg",
  name: "Sommelier",
  isTestChain: false,
  rpcUrl: "https://sommelier-rpc.lavenderfive.com",
  restEndpoint: "https://sommelier-api.polkachu.com",
  latestBlockEndpoint: "/cosmos/base/tendermint/v1beta1",
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
