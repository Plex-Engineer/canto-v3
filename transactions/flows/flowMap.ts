import { NO_ERROR, PromiseWithError, Validation } from "@/config/interfaces";
import { TxCreatorFunctionReturn } from "../interfaces";
import {
  cTokenLendingTx,
  clmClaimRewardsTx,
  validateCTokenLendingRetryTxParams,
  validateClmClaimRewardsRetryTx,
} from "../lending";
import {
  cantoDexLPTx,
  stakeCantoDexLPTx,
  validateCantoDexLPTxParams,
} from "../pairs/cantoDex";
import {
  ambientLiquidityTx,
  claimAmbientRewardsTx,
  validateAmbientClaimRewardsRetryTx,
  validateAmbientLiquidityTxParams,
} from "../pairs/ambient";
import {
  claimDexRewardsComboTx,
  validateClaimDexRewardsComboTxParams,
} from "@/hooks/pairs/lpCombo/transactions/claimRewards";
import { cantoBridgeTx, validateCantoBridgeTxParams } from "../bridge";
import { stakingTx, validateStakingTxParams } from "../staking";
import { proposalVoteTx, validateGovTxParams } from "../gov";

export enum TransactionFlowType {
  //   // Bridge
  BRIDGE = "BRIDGE",
  // LP
  AMBIENT_LIQUIDITY_TX = "AMBIENT_LIQUIDITY_TX",
  AMBIENT_CLAIM_REWARDS_TX = "AMBIENT_CLAIM_REWARDS_TX",
  CANTO_DEX_LP_TX = "CANTO_DEX_LP_TX",
  CANTO_DEX_STAKE_LP_TX = "STAKE_LP_TX",
  LP_COMBO_CLAIM_REWARDS_TX = "CLAIM_LP_REWARDS_TX",
  // CLM
  CLM_CTOKEN_TX = "CLM_CTOKEN_TX",
  CLM_CLAIM_REWARDS_TX = "CLM_CLAIM_REWARDS_TX",
  //STAKING
  STAKE_CANTO_TX = "STAKE_CANTO_TX",
  VOTE_TX = "VOTE_TX",
}

export const TRANSACTION_FLOW_MAP: {
  [key in TransactionFlowType]: {
    tx: (...params: any[]) => PromiseWithError<TxCreatorFunctionReturn>;
    validRetry: (...params: any[]) => PromiseWithError<Validation>;
  };
} = {
  [TransactionFlowType.BRIDGE]: {
    tx: async (params) => cantoBridgeTx(params),
    validRetry: async (params) => NO_ERROR(validateCantoBridgeTxParams(params)),
  },
  [TransactionFlowType.AMBIENT_LIQUIDITY_TX]: {
    tx: async (params) => ambientLiquidityTx(params),
    validRetry: async (params) =>
      NO_ERROR(validateAmbientLiquidityTxParams(params)),
  },
  [TransactionFlowType.AMBIENT_CLAIM_REWARDS_TX]: {
    tx: async (params) => claimAmbientRewardsTx(params),
    validRetry: async (params) => validateAmbientClaimRewardsRetryTx(params),
  },
  [TransactionFlowType.CANTO_DEX_LP_TX]: {
    tx: async (params) => cantoDexLPTx(params),
    validRetry: async (params) => NO_ERROR(validateCantoDexLPTxParams(params)),
  },
  [TransactionFlowType.CANTO_DEX_STAKE_LP_TX]: {
    tx: async (params) => stakeCantoDexLPTx(params),
    validRetry: async (params) => NO_ERROR(validateCantoDexLPTxParams(params)),
  },
  [TransactionFlowType.LP_COMBO_CLAIM_REWARDS_TX]: {
    tx: async (params) => claimDexRewardsComboTx(params),
    validRetry: async (params) => validateClaimDexRewardsComboTxParams(params),
  },
  [TransactionFlowType.CLM_CTOKEN_TX]: {
    tx: async (params) => cTokenLendingTx(params),
    validRetry: async (params) => validateCTokenLendingRetryTxParams(params),
  },
  [TransactionFlowType.CLM_CLAIM_REWARDS_TX]: {
    tx: async (params) => clmClaimRewardsTx(params),
    validRetry: async (params) => validateClmClaimRewardsRetryTx(params),
  },
  [TransactionFlowType.STAKE_CANTO_TX]: {
    tx: async (params) => stakingTx(params),
    validRetry: async (params) => NO_ERROR(validateStakingTxParams(params)),
  },
  [TransactionFlowType.VOTE_TX]: {
    tx: async (params) => proposalVoteTx(params),
    validRetry: async (params) => NO_ERROR(validateGovTxParams(params)),
  },
};
