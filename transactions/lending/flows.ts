import { NewTransactionFlow } from "@/config/interfaces";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { CLMClaimRewardsTxParams, CTokenLendingTransactionParams } from ".";

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
  txType: TransactionFlowType.CLAIM_LP_REWARDS_TX,
  params: {
    clmParams: params,
  },
});
