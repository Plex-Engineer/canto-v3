import { BaseNetwork } from "@/config/interfaces/networks";
import { BridgeToken } from "./tokens";
import { BridgingMethod } from "../interfaces/bridgeMethods";
import { PromiseWithError, ReturnWithError } from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";

export interface BridgeHookInputParams {
  testnet?: boolean;
  defaults?: {
    networkId?: string;
  };
}

export interface BridgeHookState {
  // all options
  availableNetworks: BaseNetwork[];
  availableTokens: BridgeToken[];
  availableMethods: BridgingMethod[];
  // default selections
  toNetwork: BaseNetwork | undefined;
  fromNetwork: BaseNetwork | undefined;
  selectedToken: BridgeToken | undefined;
  selectedMethod: BridgingMethod | undefined;
  // user addresses
  connectedEthAddress: string | undefined;
  connectedCosmosAddress: string | undefined;
  // only when ibc out of canto does this need to be set
  userInputCosmosAddress: string | undefined;
}

export interface BridgeTransactionParams {
  from: {
    network: BaseNetwork;
    account: string;
  };
  to: {
    network: BaseNetwork;
    account: string;
  };
  token: {
    data: BridgeToken;
    amount: string;
  };
  method: BridgingMethod | null;
}

export interface BridgeHookTxParams {
  amount: string;
}

export interface BridgeHookReturn {
  direction: "in" | "out";
  testnet: boolean;
  allOptions: {
    networks: BaseNetwork[];
    tokens: BridgeToken[];
    methods: BridgingMethod[];
  };
  selections: {
    toNetwork: BaseNetwork | undefined;
    fromNetwork: BaseNetwork | undefined;
    token: BridgeToken | undefined;
    method: BridgingMethod | undefined;
  };
  setState: (param: HookSetterParam, value: any) => void;
  addresses: {
    getSender: () => string | undefined;
    getReceiver: () => string | undefined;
  };
  bridge: {
    bridgeTx: (params: BridgeHookTxParams) => PromiseWithError<Transaction[]>;
    canBridge: (params: BridgeHookTxParams) => ReturnWithError<boolean>;
  };
}

export type HookSetterParam =
  | "network"
  | "token"
  | "method"
  | "ethAddress"
  | "cosmosAddress"
  | "inputCosmosAddress";
