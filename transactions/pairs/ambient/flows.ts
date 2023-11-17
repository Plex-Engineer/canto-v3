import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { AmbientClaimRewardsTxParams, AmbientTransactionParams } from ".";

export const newAmbientLPTxFlow = (
  txParams: AmbientTransactionParams
): NewTransactionFlow => ({
  title: `${txParams.txType} ${txParams.pool.symbol}`,
  icon: txParams.pool.logoURI,
  txType: TransactionFlowType.AMBIENT_LIQUIDITY_TX,
  params: txParams,
});

export const newAmbientClaimRewardsTxFlow = (
  params: AmbientClaimRewardsTxParams
): NewTransactionFlow => ({
  title: "Claim Ambient Rewards",
  icon: "/icons/canto.svg",
  txType: TransactionFlowType.AMBIENT_CLAIM_REWARDS_TX,
  params: params,
});
