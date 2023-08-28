import { CosmosNetwork } from "@/config/interfaces/networks";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const comdexBlockExplorer = "https://www.mintscan.io/comdex";

export const COMDEX: CosmosNetwork = {
  id: "comdex-1",
  chainId: "comdex-1",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.svg",
  name: "Comdex",
  isTestChain: false,
  rpcUrl: "https://rpc.comdex.one",
  restEndpoint: "https://rest.comdex.one",
  addressPrefix: "comdex",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Comdex",
    baseName: "ucmdx",
    symbol: "CMDX",
    decimals: 6,
  },
  blockExplorer: {
    url: comdexBlockExplorer,
    getAddressLink: getCosmosAddressLink(comdexBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(comdexBlockExplorer),
  },
};
