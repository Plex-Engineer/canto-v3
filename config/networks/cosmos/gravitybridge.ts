import { CosmosNetwork } from "@/config/interfaces/networks";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
} from "../helpers";

const gravityBridgeBlockExplorer = "https://www.mintscan.io/gravity-bridge";

export const GRAVITY_BRIDGE: CosmosNetwork = {
  id: "gravity-bridge",
  chainId: "gravity-bridge-3",
  icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
  name: "Gravity Bridge",
  isTestChain: false,
  rpcUrl: "https://gravitychain.io:26657",
  restEndpoint: "https://gravitychain.io:1317",
  addressPrefix: "gravity",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  nativeCurrency: {
    name: "Graviton",
    baseName: "ugraviton",
    symbol: "GRAV",
    decimals: 6,
  },
  blockExplorer: {
    url: gravityBridgeBlockExplorer,
    getAddressLink: getCosmosAddressLink(gravityBridgeBlockExplorer),
    getTransactionLink: getCosmosTransactionLink(gravityBridgeBlockExplorer),
  },
  extraEndpoints: ["https://gravity-api.polkachu.com"],
};
