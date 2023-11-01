import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const injectiveBlockExplorer = "https://www.mintscan.io/injective";

export const INJECTIVE: CosmosNetwork = {
  id: "injective-1",
  chainId: "injective-1",
  icon: "/icons/inj.svg",
  name: "Injective",
  isTestChain: false,
  rpcUrl: "https://injective-rpc.polkachu.com",
  restEndpoint: "https://lcd.injective.network",
  latestBlockEndpoint: "/cosmos/base/tendermint/v1beta1",
  addressPrefix: "inj",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Injective",
    baseName: "inj",
    symbol: "INJ",
    decimals: 18,
  },
  blockExplorer: {
    url: injectiveBlockExplorer,
    getAddressLink: getCosmosAddressLink(injectiveBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(injectiveBlockExplorer),
  },
};
