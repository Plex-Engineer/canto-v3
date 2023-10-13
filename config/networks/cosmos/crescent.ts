import { CosmosNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const crescentBlockExplorer = "https://www.mintscan.io/crescent";

export const CRESCENT: CosmosNetwork = {
  id: "crescent-1",
  chainId: "crescent-1",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.svg",
  name: "Crescent",
  isTestChain: false,
  rpcUrl: "https://mainnet.crescent.network:26657",
  restEndpoint: "https://mainnet.crescent.network:1317",
  addressPrefix: "cre",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Crescent",
    baseName: "ucre",
    symbol: "CRE",
    decimals: 6,
  },
  blockExplorer: {
    url: crescentBlockExplorer,
    getAddressLink: getCosmosAddressLink(crescentBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(crescentBlockExplorer),
  },
};
