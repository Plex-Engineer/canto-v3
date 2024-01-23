import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import { displayAmount } from "@/utils/formatting";
import {
  Transaction,
  TxCreatorFunctionReturn,
  TX_DESCRIPTIONS,
} from "../../interfaces";
import { ClaimRewardsTxParams } from ".";
import { _claimLendingRewardsTx } from "./txCreators";
import { isValidEthAddress } from "@/utils/address";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { getVivacityAddress } from "@/config/consts/vivacityAddresses";

export async function clmClaimRewardsTx(
  txParams: ClaimRewardsTxParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    // validate params
    const { data: validation, error: validationError } =
      validateClmClaimRewardsRetryTx(txParams);
    if (validationError) throw validationError;
    if (validation.error) throw new Error(validation.reason);

    // get all addresses for tx
    const [marketAddress, lendingLedgerAddress] = [
      getVivacityAddress(txParams.chainId, "vcNoteRouter"),
      getVivacityAddress(txParams.chainId, "lendingLedger")
    ]
    // check for errors
    if (!(marketAddress && lendingLedgerAddress))
      throw new Error("chainId not supported");
    // create tx list
    const txList: Transaction[] = [];
    // push claim rewards tx
    txList.push(
      _claimLendingRewardsTx(
        txParams.chainId,
        txParams.ethAccount,
        lendingLedgerAddress,
        marketAddress,
        TX_DESCRIPTIONS.CLAIM_REWARDS(
          displayAmount(txParams.estimatedRewards, 18),
          "CANTO",
          "Lending"
        )
      )
    );

    // return with no error
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("vivacityClaimRewardsTx", err);
  }
}

// nothing to validate for claming rewards retry
export function validateClmClaimRewardsRetryTx(
  txParams: ClaimRewardsTxParams
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
