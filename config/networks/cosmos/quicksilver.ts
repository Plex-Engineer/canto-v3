import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const quicksilverBlockExplorer = "https://www.mintscan.io/quicksilver";

export const QUICKSILVER: CosmosNetwork = {
  id: "quicksilver-2",
  chainId: "quicksilver-2",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
  name: "Quicksilver",
  isTestChain: false,
  rpcUrl: "https://rpc.quicksilver.zone:443",
  restEndpoint: "https://quicksilver-api.lavenderfive.com:443",
  latestBlockEndpoint: "/cosmos/base/tendermint/v1beta1",
  addressPrefix: "quick",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Quicksilver",
    baseName: "uqck",
    symbol: "QCK",
    decimals: 6,
  },
  blockExplorer: {
    url: quicksilverBlockExplorer,
    getAddressLink: getCosmosAddressLink(quicksilverBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(quicksilverBlockExplorer),
  },
};
