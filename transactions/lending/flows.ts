import { CLMClaimRewardsTxParams, CTokenLendingTransactionParams } from ".";
import { NewTransactionFlow, TransactionFlowType } from "../flows";

export const newCTokenLendingFlow = (
  txParams: CTokenLendingTransactionParams
): NewTransactionFlow => ({
  title: txParams.txType + " " + txParams.cToken.underlying.symbol,
  icon: txParams.cToken.underlying.logoURI,
  txType: TransactionFlowType.CLM_CTOKEN_TX,
  params: txParams,
});

export const newClaimCLMRewardsFlow = (
  txParams: CLMClaimRewardsTxParams
): NewTransactionFlow => ({
  title: "Claim Rewards",
  icon: "/icons/canto.svg",
  txType: TransactionFlowType.CLM_CLAIM_REWARDS_TX,
  params: {
    clmParams: txParams,
  },
});
