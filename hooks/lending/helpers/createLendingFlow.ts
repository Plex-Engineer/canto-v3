import {
  NO_ERROR,
  ReturnWithError,
  NewTransactionFlow,
} from "@/config/interfaces";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
} from "../interfaces/lendingTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

export function createNewCTokenLendingFlow(
  params: CTokenLendingTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType + " " + params.cToken.underlying.symbol,
    icon: params.cToken.underlying.logoURI,
    txType: TransactionFlowType.CLM_CTOKEN_TX,
    params: params,
  });
}

export function createNewClaimCLMRewardsFlow(
  params: CLMClaimRewardsTxParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: "Claim Rewards",
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
    txType: TransactionFlowType.CLM_CLAIM_REWARDS,
    params: params,
  });
}
