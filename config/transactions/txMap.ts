import { BridgeTransactionParams } from "@/hooks/bridge/interfaces/hookParams";
import {
  bridgeInTx,
  bridgeOutTx,
  validateBridgeInTxParams,
  validateBridgeOutTxParams,
} from "@/hooks/bridge/transactions/bridge";
import { Transaction } from "../interfaces/transactions";
import { PromiseWithError } from "../interfaces/errors";

export enum TransactionFlowType {
  BRIDGE_IN = "BRIDGE_IN",
  BRIDGE_OUT = "BRIDGE_OUT",
}

export const TRANSACTION_FLOW_MAP: {
  [key in TransactionFlowType]: {
    validParams: (...params: any[]) => PromiseWithError<{
      valid: boolean;
      error?: string;
    }>;
    tx: (...params: any[]) => PromiseWithError<Transaction[]>;
  };
} = {
  [TransactionFlowType.BRIDGE_IN]: {
    validParams: async (params: BridgeTransactionParams) =>
      validateBridgeInTxParams(params),
    tx: async (params: BridgeTransactionParams) => bridgeInTx(params),
  },
  [TransactionFlowType.BRIDGE_OUT]: {
    validParams: async (params: BridgeTransactionParams) =>
      validateBridgeOutTxParams(params),
    tx: async (params: BridgeTransactionParams) => bridgeOutTx(params),
  },
};
