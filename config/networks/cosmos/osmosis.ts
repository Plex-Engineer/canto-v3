import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const osmosisBlockExplorer = "https://www.mintscan.io/osmosis";

export const OSMOSIS: CosmosNetwork = {
  id: "osmosis-1",
  chainId: "osmosis-1",
  icon: "/icons/osmo.svg",
  name: "Osmosis",
  isTestChain: false,
  rpcUrl: "https://rpc.osmosis.zone",
  restEndpoint: "https://lcd.osmosis.zone",
  extraEndpoints: ["https://osmosis-api.lavenderfive.com:443"],
  latestBlockEndpoint: "/cosmos/base/tendermint/v1beta1",
  addressPrefix: "osmo",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Osmosis",
    baseName: "uosmo",
    symbol: "OSMO",
    decimals: 6,
  },
  blockExplorer: {
    url: osmosisBlockExplorer,
    getAddressLink: getCosmosAddressLink(osmosisBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(osmosisBlockExplorer),
  },
};
