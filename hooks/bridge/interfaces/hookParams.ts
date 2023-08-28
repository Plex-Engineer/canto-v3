import { BaseNetwork } from "@/config/interfaces/networks";
import { BridgeToken } from "./tokens";
import { BridgingMethod } from "../interfaces/bridgeMethods";
import { PromiseWithError, ReturnWithError } from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";

export interface BridgeHookInputParams {
  userEthAddress?: string;
  userCosmosAddress?: string;
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
  toNetwork: BaseNetwork | null;
  fromNetwork: BaseNetwork | null;
  selectedToken: BridgeToken | null;
  selectedMethod: BridgingMethod | null;
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
  sender: string;
  receiver: string;
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
    toNetwork: BaseNetwork | null;
    fromNetwork: BaseNetwork | null;
    token: BridgeToken | null;
    method: BridgingMethod | null;
  };
  setters: {
    network: (id: string) => void;
    token: (id: string) => void;
    method: (method: BridgingMethod) => void;
  };
  bridge: {
    bridgeTx: (params: BridgeHookTxParams) => PromiseWithError<Transaction[]>;
    canBridge: (params: BridgeHookTxParams) => ReturnWithError<boolean>;
  };
}
