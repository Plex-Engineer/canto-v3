import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const kavaBlockExplorer = "https://www.mintscan.io/kava";

export const KAVA: CosmosNetwork = {
  id: "kava_2222-10",
  chainId: "kava_2222-10",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
  name: "Kava",
  isTestChain: false,
  rpcUrl: "https://rpc.data.kava.io",
  restEndpoint: "https://api.data.kava.io",
  addressPrefix: "kava",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Kava",
    baseName: "ukava",
    symbol: "KAVA",
    decimals: 6,
  },
  blockExplorer: {
    url: kavaBlockExplorer,
    getAddressLink: getCosmosAddressLink(kavaBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(kavaBlockExplorer),
  },
};
