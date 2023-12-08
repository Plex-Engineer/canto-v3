import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { CTokenLendingTransactionParams, CTokenLendingTxTypes } from ".";
import {
  _collateralizeTx,
  _lendingCTokenTx,
  _withdrawAllCTokenTx,
} from "./txCreators";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { areEqualAddresses, isValidEthAddress } from "@/utils/address";
import { maxAmountForLendingTx } from "@/utils/clm";
import { greaterThan, validateWeiUserInputTokenAmount } from "@/utils/math";
import { MAX_UINT256, getCantoCoreAddress } from "@/config/consts/addresses";
import { createApprovalTxs } from "../erc20";
import { displayAmount } from "@/utils/formatting";
import {
  Transaction,
  TxCreatorFunctionReturn,
  TX_DESCRIPTIONS,
} from "../interfaces";
import { getAllUserCLMData } from "@/hooks/lending/helpers/userClmData";
import { isCantoChainId } from "@/utils/networks";

export async function cTokenLendingTx(
  txParams: CTokenLendingTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  /** use try catch, throw all errors along the way */
  try {
    /**  validate params */
    const validation = validateCTokenLendingTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    /** Typeguard for user details */
    if (!txParams.cToken.userDetails) throw new Error("User Details missing");

    /**  check if collateralizing tx */
    if (
      txParams.txType === CTokenLendingTxTypes.COLLATERALIZE ||
      txParams.txType === CTokenLendingTxTypes.DECOLLATERALIZE
    ) {
      /**  get comptroller address */
      const comptrollerAddress = getCantoCoreAddress(
        txParams.chainId,
        "comptroller"
      );
      if (!comptrollerAddress) throw new Error("chainId not supported");

      const isCollateralize =
        txParams.txType === CTokenLendingTxTypes.COLLATERALIZE;
      return NO_ERROR({
        transactions: [
          _collateralizeTx(
            txParams.chainId,
            comptrollerAddress,
            txParams.cToken.address,
            isCollateralize,
            TX_DESCRIPTIONS.CTOKEN_COLLATERALIZE(
              txParams.cToken.underlying.symbol,
              isCollateralize
            )
          ),
        ],
      });
    }
    /** lending action */

    /** create tx list */
    const txList: Transaction[] = [];

    /** check to see if token is cCanto */
    const cCantoAddress = getCantoCoreAddress(txParams.chainId, "cCanto");
    if (!cCantoAddress) throw new Error("chainId not supported");
    const isCanto = areEqualAddresses(txParams.cToken.address, cCantoAddress);

    /** check if approval is needed (only for supply and repay) */
    if (
      !isCanto &&
      (txParams.txType === CTokenLendingTxTypes.SUPPLY ||
        txParams.txType === CTokenLendingTxTypes.REPAY)
    ) {
      const { data: allowanceTxs, error: allowanceError } =
        await createApprovalTxs(
          txParams.chainId,
          txParams.ethAccount,
          [
            {
              address: txParams.cToken.underlying.address,
              symbol: txParams.cToken.underlying.symbol,
            },
          ],
          [txParams.amount],
          { address: txParams.cToken.address, name: "Lending Market" }
        );
      if (allowanceError) throw allowanceError;
      // push allowance txs to the list (might be none)
      txList.push(...allowanceTxs);
    }

    /** create lending tx */

    // describe tx
    const txDescription = TX_DESCRIPTIONS.CTOKEN_LENDING(
      txParams.txType,
      txParams.cToken.underlying.symbol,
      displayAmount(txParams.amount, txParams.cToken.underlying.decimals)
    );

    // check if max is needed (only for repay and withdraw)
    if (txParams.max) {
      /** check withdraw */
      if (
        txParams.txType === CTokenLendingTxTypes.WITHDRAW &&
        txParams.cToken.userDetails.supplyBalanceInUnderlying ===
          txParams.amount
      ) {
        /** push special withdraw all function, passing in cToken balance instead */
        txList.push(
          _withdrawAllCTokenTx(
            txParams.chainId,
            txParams.cToken.address,
            txParams.cToken.userDetails.balanceOfCToken,
            txDescription
          )
        );
        // return tx list
        return NO_ERROR({ transactions: txList });
      }
      /** check repay full balance */
      if (
        txParams.txType === CTokenLendingTxTypes.REPAY &&
        greaterThan(
          txParams.cToken.userDetails.balanceOfUnderlying,
          txParams.cToken.userDetails.borrowBalance
        ).data
      ) {
        // change the amount to max uint
        txParams.amount = MAX_UINT256;
      }
    }
    /** push lending tx to list */
    txList.push(
      _lendingCTokenTx(
        txParams.txType,
        txParams.chainId,
        txParams.cToken.address,
        isCanto,
        txParams.amount,
        txDescription
      )
    );

    /** check if token should be enabled as collateral */
    if (
      txParams.txType === CTokenLendingTxTypes.SUPPLY &&
      !txParams.cToken.userDetails.isCollateral &&
      Number(txParams.cToken.collateralFactor) !== 0
    ) {
      // get comptroller address
      const comptrollerAddress = getCantoCoreAddress(
        txParams.chainId,
        "comptroller"
      );
      if (!comptrollerAddress) throw new Error("chainId not supported");
      txList.push(
        _collateralizeTx(
          txParams.chainId,
          comptrollerAddress,
          txParams.cToken.address,
          true,
          TX_DESCRIPTIONS.CTOKEN_COLLATERALIZE(
            txParams.cToken.underlying.symbol,
            true
          )
        )
      );
    }

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("cTokenLendingTx", err);
  }
}

// validates parameters for tx
export function validateCTokenLendingTxParams(
  txParams: CTokenLendingTransactionParams
): Validation {
  // tx must be on a canto chain
  if (!isCantoChainId(txParams.chainId)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.CHAIN_NOT_SUPPORTED(txParams.chainId),
    };
  }

  // user details on token must be available
  if (!txParams.cToken.userDetails) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_MISSING("User Details"),
    };
  }
  // validate eth account
  if (!isValidEthAddress(txParams.ethAccount)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("Eth Account"),
    };
  }
  // get max amount for this tx
  const maxAmount = maxAmountForLendingTx(
    txParams.txType,
    txParams.cToken,
    txParams.userPosition,
    100
  );
  // validate amount
  return validateWeiUserInputTokenAmount(
    txParams.amount,
    "1",
    maxAmount,
    txParams.cToken.underlying.symbol,
    txParams.cToken.underlying.decimals
  );
}

// validates parameters for retry tx
export async function validateCTokenLendingRetryTxParams(
  txParams: CTokenLendingTransactionParams
): PromiseWithError<Validation> {
  // position may not be the same as the one in the store, so we need to validate it
  const { data: currentPosition, error } = await getAllUserCLMData(
    txParams.ethAccount,
    txParams.chainId,
    []
  );
  if (error || !currentPosition.position) {
    return NEW_ERROR("validateCTokenLendingRetryTxParams", error);
  }
  // validate with new position
  return NO_ERROR(
    validateCTokenLendingTxParams({
      ...txParams,
      userPosition: currentPosition.position,
    })
  );
}
