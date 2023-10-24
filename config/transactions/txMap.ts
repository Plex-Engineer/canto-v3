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
import {
  CantoDexTransactionParams,
  StakeLPParams,
} from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import {
  cantoDexLPTx,
  stakeLPFlow,
} from "@/hooks/pairs/cantoDex/transactions/pairsTx";
import {
  ClaimDexRewardsParams,
  claimDexRewardsComboTx,
} from "@/hooks/pairs/lpCombo/transactions/claimRewards";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { ambientLiquidityTx } from "@/hooks/pairs/newAmbient/transactions/ambientTx";

export enum TransactionFlowType {
  BRIDGE_IN = "BRIDGE_IN",
  BRIDGE_OUT = "BRIDGE_OUT",
  AMBIENT_LIQUIDITY_TX = "AMBIENT_LIQUIDITY_TX",
  CANTO_DEX_LP_TX = "CANTO_DEX_LP_TX",
  CLAIM_LP_REWARDS_TX = "CLAIM_LP_REWARDS_TX",
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
  [TransactionFlowType.AMBIENT_LIQUIDITY_TX]: {
    validRetry: async (params: AmbientTransactionParams) =>
      NO_ERROR({ valid: false }),
    tx: async (params: AmbientTransactionParams) => ambientLiquidityTx(params),
  },
  [TransactionFlowType.CANTO_DEX_LP_TX]: {
    validRetry: async (params: CantoDexTransactionParams) =>
      NO_ERROR({ valid: false }),
    tx: async (params: CantoDexTransactionParams) => cantoDexLPTx(params),
  },
  [TransactionFlowType.CLAIM_LP_REWARDS_TX]: {
    validRetry: async (params: ClaimDexRewardsParams) =>
      NO_ERROR({ valid: true }),
    tx: async (params: ClaimDexRewardsParams) => claimDexRewardsComboTx(params),
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
