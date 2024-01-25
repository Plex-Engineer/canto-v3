import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import { AmbientClaimRewardsTxParams } from ".";
import {
  TX_DESCRIPTIONS,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { _ambientClaimRewardsTx } from "./txCreators";
import { displayAmount } from "@/utils/formatting";
import { isValidEthAddress } from "@/utils/address";

export function claimAmbientRewardsTx(
  txParams: AmbientClaimRewardsTxParams
): ReturnWithError<TxCreatorFunctionReturn> {
  // check tx params
  const { data: validation, error } =
    validateAmbientClaimRewardsRetryTx(txParams);
  if (error) return NEW_ERROR("claimAmbientRewardsTx", error);
  if (validation.error) return NEW_ERROR("claimAmbientRewardsTx", error);

  return NO_ERROR({
    transactions: txParams.rewards.map((rewObj) =>
      _ambientClaimRewardsTx(
        txParams.chainId,
        txParams.ethAccount,
        rewObj.rewardsLedgerAddress,
        TX_DESCRIPTIONS.CLAIM_REWARDS(
          displayAmount(rewObj.estimatedRewards, 18),
          "CANTO",
          `Ambient ${rewObj.poolName}`
        )
      )
    ),
  });
}
// nothing to validate for claming rewards retry
export function validateAmbientClaimRewardsRetryTx(
  txParams: AmbientClaimRewardsTxParams
): ReturnWithError<Validation> {
  /** check eth account */
  if (!isValidEthAddress(txParams.ethAccount)) {
    return NO_ERROR({
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethAccount"),
    });
  }
  return NO_ERROR({ error: false });
}
