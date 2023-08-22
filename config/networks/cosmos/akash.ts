import { CosmosNetwork } from "@/config/interfaces/networks";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const akashBlockExplorer = "https://www.mintscan.io/akash";

export const AKASH: CosmosNetwork = {
  id: "akashnet-2",
  chainId: "akashnet-2",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.svg",
  name: "Akash",
  isTestChain: false,
  rpcUrl: "https://akash-rpc.polkachu.com",
  restEndpoint: "https://api-akash-ia.cosmosia.notional.ventures",
  addressPrefix: "akash",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Akash",
    baseName: "uakt",
    symbol: "AKT",
    decimals: 6,
  },
  blockExplorer: {
    url: akashBlockExplorer,
    getAddressLink: getCosmosAddressLink(akashBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(akashBlockExplorer),
  },
};
