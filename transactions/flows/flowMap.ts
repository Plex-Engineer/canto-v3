import { NO_ERROR, PromiseWithError, Validation } from "@/config/interfaces";
import { TxCreatorFunctionReturn } from "../interfaces";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
  cTokenLendingTx,
  clmClaimRewardsTx,
  validateCTokenLendingRetryTxParams,
  validateClmClaimRewardsRetryTx,
} from "../lending";
import {
  CantoDexTransactionParams,
  cantoDexLPTx,
  stakeCantoDexLPTx,
  validateCantoDexLPTxParams,
} from "../pairs/cantoDex";

export enum TransactionFlowType {
  //   // Bridge
  //   BRIDGE_IN = "BRIDGE_IN",
  //   BRIDGE_OUT = "BRIDGE_OUT",
  //   // LP
  //   AMBIENT_LIQUIDITY_TX = "AMBIENT_LIQUIDITY_TX",
  CANTO_DEX_LP_TX = "CANTO_DEX_LP_TX",
  CANTO_DEX_STAKE_LP_TX = "STAKE_LP_TX",
  //   CLAIM_LP_REWARDS_TX = "CLAIM_LP_REWARDS_TX",
  // CLM
  CLM_CTOKEN_TX = "CLM_CTOKEN_TX",
  CLM_CLAIM_REWARDS_TX = "CLM_CLAIM_REWARDS_TX",
}

export const TRANSACTION_FLOW_MAP: {
  [key in TransactionFlowType]: {
    tx: (...params: any[]) => PromiseWithError<TxCreatorFunctionReturn>;
    validRetry: (...params: any[]) => PromiseWithError<Validation>;
  };
} = {
  //   [TransactionFlowType.BRIDGE_IN]: {
  //     validRetry: async (params: BridgeTransactionParams) =>
  //       validateBridgeInRetryParams(params),
  //     tx: async (params: BridgeTransactionParams) => bridgeInTx(params),
  //   },
  //   [TransactionFlowType.BRIDGE_OUT]: {
  //     validRetry: async (params: BridgeTransactionParams) =>
  //       validateBridgeOutRetryParams(params),
  //     tx: async (params: BridgeTransactionParams) => bridgeOutTx(params),
  //   },
  //   [TransactionFlowType.AMBIENT_LIQUIDITY_TX]: {
  //     validRetry: async (params: AmbientTransactionParams) =>
  //       NO_ERROR({ valid: false }),
  //     tx: async (params: AmbientTransactionParams) => ambientLiquidityTx(params),
  //   },
  [TransactionFlowType.CANTO_DEX_LP_TX]: {
    tx: async (params: CantoDexTransactionParams) => cantoDexLPTx(params),
    validRetry: async (params: CantoDexTransactionParams) =>
      NO_ERROR(validateCantoDexLPTxParams(params)),
  },
  [TransactionFlowType.CANTO_DEX_STAKE_LP_TX]: {
    tx: async (params: CantoDexTransactionParams) => stakeCantoDexLPTx(params),
    validRetry: async (params: CantoDexTransactionParams) =>
      NO_ERROR(validateCantoDexLPTxParams(params)),
  },
  //   [TransactionFlowType.CLAIM_LP_REWARDS_TX]: {
  //     validRetry: async (params: ClaimDexRewardsParams) =>
  //       NO_ERROR({ valid: true }),
  //     tx: async (params: ClaimDexRewardsParams) => claimDexRewardsComboTx(params),
  //   },
  [TransactionFlowType.CLM_CTOKEN_TX]: {
    tx: async (params: CTokenLendingTransactionParams) =>
      cTokenLendingTx(params),
    validRetry: async (params: CTokenLendingTransactionParams) =>
      validateCTokenLendingRetryTxParams(params),
  },
  [TransactionFlowType.CLM_CLAIM_REWARDS_TX]: {
    tx: async (params: CLMClaimRewardsTxParams) => clmClaimRewardsTx(params),
    validRetry: async (params: CLMClaimRewardsTxParams) =>
      validateClmClaimRewardsRetryTx(params),
  },
};
