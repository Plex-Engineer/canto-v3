import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const sentinelBlockExplorer = "https://www.mintscan.io/sentinel";

export const SENTINEL: CosmosNetwork = {
  id: "sentinelhub-2",
  chainId: "sentinelhub-2",
  icon: "/icons/dvpn.svg",
  name: "Sentinel",
  isTestChain: false,
  rpcUrl: "https://rpc-sentinel-ia.cosmosia.notional.ventures/",
  restEndpoint: "https://api-sentinel-ia.cosmosia.notional.ventures/",
  addressPrefix: "sent",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Sentinel",
    baseName: "udvpn",
    symbol: "DVPN",
    decimals: 6,
  },
  blockExplorer: {
    url: sentinelBlockExplorer,
    getAddressLink: getCosmosAddressLink(sentinelBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(sentinelBlockExplorer),
  },
};
