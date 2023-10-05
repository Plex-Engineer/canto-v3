import {
  PromiseWithError,
  NO_ERROR,
  TxCreatorFunctionReturn,
} from "../interfaces";
import { BridgeTransactionParams } from "@/hooks/bridge/interfaces/hookParams";
import {
  bridgeInTx,
  bridgeOutTx,
  validateBridgeInRetryParams,
  validateBridgeOutRetryParams,
} from "@/hooks/bridge/transactions/bridge";
import { CTokenLendingTransactionParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import {
  cTokenLendingTx,
  validateCTokenLendingRetryParams,
} from "@/hooks/lending/transactions/lending";
import { AmbientTransactionParams } from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";
import { ambientLiquidityTx } from "@/hooks/pairs/ambient/transactions.ts/ambientTx";
import {
  CantoDexTransactionParams,
  StakeLPParams,
} from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import {
  cantoDexLPTx,
  stakeLPFlow,
} from "@/hooks/pairs/cantoDex/transactions/pairsTx";

export enum TransactionFlowType {
  AMBIENT_LIQUIDITY_TX = "AMBIENT_LIQUIDITY_TX",
  BRIDGE_IN = "BRIDGE_IN",
  BRIDGE_OUT = "BRIDGE_OUT",
  CANTO_DEX_LP_TX = "CANTO_DEX_LP_TX",
  CLM_CTOKEN_TX = "CLM_CTOKEN_TX",
  STAKE_LP_TX = "STAKE_LP_TX",
}

export const TRANSACTION_FLOW_MAP: {
  [key in TransactionFlowType]: {
    validRetry: (...params: any[]) => PromiseWithError<{
      valid: boolean;
      error?: string;
    }>;
    tx: (...params: any[]) => PromiseWithError<TxCreatorFunctionReturn>;
  };
} = {
  [TransactionFlowType.AMBIENT_LIQUIDITY_TX]: {
    validRetry: async (params: AmbientTransactionParams) =>
      NO_ERROR({ valid: false }),
    tx: async (params: AmbientTransactionParams) => ambientLiquidityTx(params),
  },
  [TransactionFlowType.BRIDGE_IN]: {
    validRetry: async (params: BridgeTransactionParams) =>
      validateBridgeInRetryParams(params),
    tx: async (params: BridgeTransactionParams) => bridgeInTx(params),
  },
  [TransactionFlowType.BRIDGE_OUT]: {
    validRetry: async (params: BridgeTransactionParams) =>
      validateBridgeOutRetryParams(params),
    tx: async (params: BridgeTransactionParams) => bridgeOutTx(params),
  },
  [TransactionFlowType.CANTO_DEX_LP_TX]: {
    validRetry: async (params: CantoDexTransactionParams) =>
      NO_ERROR({ valid: false }),
    tx: async (params: CantoDexTransactionParams) => cantoDexLPTx(params),
  },
  [TransactionFlowType.CLM_CTOKEN_TX]: {
    validRetry: async (params: CTokenLendingTransactionParams) =>
      validateCTokenLendingRetryParams(params),
    tx: async (params: CTokenLendingTransactionParams) =>
      cTokenLendingTx(params),
  },
  [TransactionFlowType.STAKE_LP_TX]: {
    validRetry: async (params: StakeLPParams) => NO_ERROR({ valid: false }),
    tx: async (params: StakeLPParams) => stakeLPFlow(params),
  },
};
