import { BridgeTransactionParams } from "@/hooks/bridge/interfaces/hookParams";
import {
  bridgeInTx,
  bridgeOutTx,
  validateBridgeInTxParams,
  validateBridgeOutTxParams,
} from "@/hooks/bridge/transactions/bridge";
import { Transaction } from "../interfaces/transactions";
import { PromiseWithError } from "../interfaces/errors";
import { CTokenLendingTransactionParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import {
  cTokenLendingTx,
  validateCTokenLendingTxParams,
} from "@/hooks/lending/transactions/lending";

export enum TransactionFlowType {
  BRIDGE_IN = "BRIDGE_IN",
  BRIDGE_OUT = "BRIDGE_OUT",
  CLM_CTOKEN_TX = "CLM_CTOKEN_TX",
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
  [TransactionFlowType.CLM_CTOKEN_TX]: {
    validParams: async (params: CTokenLendingTransactionParams) =>
      validateCTokenLendingTxParams(params),
    tx: async (params: CTokenLendingTransactionParams) =>
      cTokenLendingTx(params),
  },
};
