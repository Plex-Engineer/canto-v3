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
  rpcUrl: "https://injective-1-public-rpc.mesa.ec1-prod.newmetric.xyz",
  restEndpoint: "https://injective-1-public-rest.mesa.ec1-prod.newmetric.xyz",
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
