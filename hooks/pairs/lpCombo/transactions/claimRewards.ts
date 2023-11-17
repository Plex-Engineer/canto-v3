import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import {
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import {
  CLMClaimRewardsTxParams,
  clmClaimRewardsTx,
} from "@/transactions/lending";
import {
  AmbientClaimRewardsTxParams,
  claimAmbientRewardsTx,
} from "@/transactions/pairs/ambient";

interface ClaimDexRewardsParams {
  clmParams?: CLMClaimRewardsTxParams;
  ambientParams?: AmbientClaimRewardsTxParams;
}
// transaction for claiming rewards in the clm and ambient dex
export async function claimDexRewardsComboTx(
  params: ClaimDexRewardsParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    const txList: Transaction[] = [];
    if (params.clmParams && params.clmParams?.estimatedRewards !== "0") {
      const { data: clmRewards, error: clmError } = await clmClaimRewardsTx(
        params.clmParams
      );
      if (clmError) throw clmError;
      txList.push(...clmRewards.transactions);
    }
    if (
      params.ambientParams &&
      params.ambientParams?.estimatedRewards !== "0"
    ) {
      const { data: ambientRewards, error: ambientError } =
        claimAmbientRewardsTx(params.ambientParams);
      if (ambientError) throw ambientError;
      txList.push(...ambientRewards.transactions);
    }
    // check that there are transactions to return
    if (txList.length === 0) throw Error("No transactions to return");

    // return the list of transactions
    return NO_ERROR({
      transactions: txList,
    });
  } catch (err) {
    return NEW_ERROR("claimDexRewardsComboTx", err);
  }
}
export function validateClaimDexRewardsComboTxParams(
  _params: ClaimDexRewardsParams
): ReturnWithError<Validation> {
  return NO_ERROR({ error: false });
}
