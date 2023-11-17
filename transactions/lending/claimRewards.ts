import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { getTokenBalance } from "@/utils/tokens";
import { displayAmount } from "@/utils/formatting";
import {
  Transaction,
  TxCreatorFunctionReturn,
  TX_DESCRIPTIONS,
} from "../interfaces";
import { CLMClaimRewardsTxParams } from ".";
import { _claimLendingRewardsTx, _dripComptrollerTx } from "./txCreators";

export async function clmClaimRewardsTx(
  txParams: CLMClaimRewardsTxParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    // get all addresses for tx
    const [wcantoAddress, comptrollerAddress, reservoirAddress] = [
      getCantoCoreAddress(txParams.chainId, "wcanto"),
      getCantoCoreAddress(txParams.chainId, "comptroller"),
      getCantoCoreAddress(txParams.chainId, "reservoir"),
    ];
    // check for errors
    if (!(wcantoAddress && comptrollerAddress && reservoirAddress))
      throw new Error("chainId not supported");
    // create tx list
    const txList: Transaction[] = [];

    // check if drip needs to be called (if balance is less than estimated rewards)
    const { data: comptrollerBalance, error: comptrollerBalanceError } =
      await getTokenBalance(
        txParams.chainId,
        wcantoAddress,
        comptrollerAddress
      );
    if (comptrollerBalanceError) throw comptrollerBalanceError;

    if (comptrollerBalance.lte(txParams.estimatedRewards)) {
      // must call drip
      txList.push(
        _dripComptrollerTx(
          txParams.chainId,
          reservoirAddress,
          TX_DESCRIPTIONS.DRIP_COMPTROLLER()
        )
      );
    }
    // push claim rewards tx
    txList.push(
      _claimLendingRewardsTx(
        txParams.chainId,
        txParams.ethAccount,
        comptrollerAddress,
        TX_DESCRIPTIONS.CLAIM_REWARDS(
          displayAmount(txParams.estimatedRewards, 18),
          "WCANTO",
          "Lending"
        )
      )
    );

    // return with no error
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("clmClaimRewardsTx", err);
  }
}

// nothing to validate for claming rewards retry
export function validateClmClaimRewardsRetryTx(
  _txParams: CLMClaimRewardsTxParams
): ReturnWithError<Validation> {
  return NO_ERROR({ error: false });
}
