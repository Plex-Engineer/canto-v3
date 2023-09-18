import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const evmosBlockExplorer = "https://www.mintscan.io/evmos";

export const EVMOS: CosmosNetwork = {
  id: "evmos_9001-2",
  chainId: "evmos_9001-2",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.svg",
  name: "Evmos",
  isTestChain: false,
  rpcUrl: "https://evmos.kingnodes.com",
  restEndpoint: "https://evmos.kingnodes.com",
  addressPrefix: "evmos",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Evmos",
    baseName: "aevmos",
    symbol: "EVMOS",
    decimals: 18,
  },
  blockExplorer: {
    url: evmosBlockExplorer,
    getAddressLink: getCosmosAddressLink(evmosBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(evmosBlockExplorer),
  },
};
