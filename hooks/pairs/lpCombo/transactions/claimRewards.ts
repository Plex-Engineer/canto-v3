// transaction for claiming rewards in the clm and ambient dex

import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
  TxCreatorFunctionReturn,
  errMsg,
} from "@/config/interfaces";
import { claimAmbientRewardsTx } from "../../newAmbient/transactions/ambientTx";
import { CLMClaimRewardsTxParams, clmClaimRewardsTx } from "@/transactions/lending";

export interface ClaimDexRewardsParams {
  clmParams?: CLMClaimRewardsTxParams;
  ambientParams?: CLMClaimRewardsTxParams;
}
export async function claimDexRewardsComboTx(
  params: ClaimDexRewardsParams
): PromiseWithError<TxCreatorFunctionReturn> {
  const txList: Transaction[] = [];
  if (params.clmParams) {
    const { data: lendingRewards, error: clmError } = await clmClaimRewardsTx(
      params.clmParams
    );
    if (clmError) {
      return NEW_ERROR("claimDexRewardsComboTx::" + errMsg(clmError));
    }
    txList.push(...lendingRewards.transactions);
  }
  if (params.ambientParams) {
    const { data: ambientRewards, error: ambientError } = claimAmbientRewardsTx(
      params.ambientParams
    );
    if (ambientError) {
      return NEW_ERROR("claimDexRewardsComboTx::" + errMsg(ambientError));
    }
    txList.push(...ambientRewards.transactions);
  }

  return NO_ERROR({ transactions: txList });
}
