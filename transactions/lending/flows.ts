import { CLMClaimRewardsTxParams, CTokenLendingTransactionParams } from ".";
import { NewTransactionFlow, TransactionFlowType } from "../config";

export const newCTokenLendingFlow = (
  params: CTokenLendingTransactionParams
): NewTransactionFlow => ({
  title: params.txType + " " + params.cToken.underlying.symbol,
  icon: params.cToken.underlying.logoURI,
  txType: TransactionFlowType.CLM_CTOKEN_TX,
  params: params,
});

export const newClaimCLMRewardsFlow = (
  params: CLMClaimRewardsTxParams
): NewTransactionFlow => ({
  title: "Claim Rewards",
  icon: "/icons/canto.svg",
  txType: TransactionFlowType.CLM_CLAIM_REWARDS_TX,
  params: {
    clmParams: params,
  },
});
