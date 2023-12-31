interface Network {
  id: string;
  icon: string;
  name: string;
  isTestChain: boolean;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    baseName: string; // no decimal unit (ex. uatom, wei, acanto)
    symbol: string;
    decimals: number;
    icon?: string;
  };
  blockExplorer?: {
    url: string;
    // construct link to address on block explorer
    getAddressLink: (address: string) => string;
    // construct link to transaction on block explorer
    getTransactionLink: (txnId: string) => string;
  };
}
export interface EVMNetwork extends Network {
  chainId: number;
  multicall3Address?: `0x${string}`;
}

export interface CosmosNetwork extends Network {
  chainId: string;
  restEndpoint: string;
  addressPrefix: string; // what the address must start with
  checkAddress: (address: string) => boolean; // check if address is valid for chain
  latestBlockEndpoint?: string; // endpoint to get latest block (might be different from normal rest endpoint)
  extraEndpoints?: string[]; // extra endpoints to use for RPC calls
  altName?: string; // other name to use for the chain (ex. "Ethereum" for "Ethereum via Gravity Bridge")
}

export type BaseNetwork = EVMNetwork | CosmosNetwork;
