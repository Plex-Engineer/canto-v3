import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const strideBlockExplorer = "https://www.mintscan.io/stride";

export const STRIDE: CosmosNetwork = {
  id: "stride-1",
  chainId: "stride-1",
  icon: "/icons/strd.svg",
  name: "Stride",
  isTestChain: false,
  rpcUrl: "https://stride-rpc.polkachu.com/",
  restEndpoint: "https://stride-api.polkachu.com/",
  latestBlockEndpoint: "/cosmos/base/tendermint/v1beta1",
  addressPrefix: "stride",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Stride",
    baseName: "ustrd",
    symbol: "STRD",
    decimals: 6,
  },
  blockExplorer: {
    url: strideBlockExplorer,
    getAddressLink: getCosmosAddressLink(strideBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(strideBlockExplorer),
  },
};
