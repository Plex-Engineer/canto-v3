import {
    NEW_ERROR,
    NO_ERROR,
    PromiseWithError,
    Validation,
} from "@/config/interfaces";
import { CTokenLendingTransactionParams, CTokenLendingTxTypes, getVCNoteAmountFromNote } from ".";
import {
    _lendingCTokenTx,
    _withdrawAllCTokenTx,
} from "./txCreators";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { isValidEthAddress } from "@/utils/address";
import { maxAmountForLendingTx } from ".";
import {
    validateWeiUserInputTokenAmount,
} from "@/utils/math";
import { createApprovalTxs } from "../../erc20";
import { displayAmount } from "@/utils/formatting";
import {
    Transaction,
    TxCreatorFunctionReturn,
    TX_DESCRIPTIONS,
} from "../../interfaces";
import { isCantoChainId } from "@/utils/networks";
import { getVivacityLMData } from "@/hooks/lending/helpers/vivacityLmData";
import { getVivacityAddress } from "@/config/consts/vivacityAddresses";

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

        /** lending action */

        /** create tx list */
        const txList: Transaction[] = [];

        const vcNoteRouterAddress = getVivacityAddress(txParams.chainId, "vcNoteRouter")

        // calculate amount of vcNote from note amount and exchange rate (required for withdraw transaction)
        const vcNoteAmount = getVCNoteAmountFromNote(txParams.amount, txParams.cToken.exchangeRate);
        /** create approval txs */
        if (txParams.txType === CTokenLendingTxTypes.SUPPLY) {
            const approvalAmount = txParams.amount;
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
                    [approvalAmount],
                    { address: vcNoteRouterAddress as `0x${string}`, name: "Lending Market" }
                );
            if (allowanceError) throw allowanceError;
            // push allowance txs to the list (might be none)
            txList.push(...allowanceTxs);
        }
        else if (txParams.txType === CTokenLendingTxTypes.WITHDRAW) {
            const approvalAmount = txParams.max && txParams.cToken.userDetails.supplyBalanceInUnderlying ===
                txParams.amount ? txParams.cToken.userDetails.balanceOfCToken : getVCNoteAmountFromNote(txParams.amount, txParams.cToken.exchangeRate);
            const { data: allowanceTxs, error: allowanceError } =
                await createApprovalTxs(
                    txParams.chainId,
                    txParams.ethAccount,
                    [
                        {
                            address: txParams.cToken.address,
                            symbol: txParams.cToken.symbol,
                        },
                    ],
                    [approvalAmount],
                    { address: vcNoteRouterAddress as `0x${string}`, name: "Lending Market" }
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

        // check if max is needed (only for withdraw)
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
                        txParams.ethAccount,
                        txParams.cToken.userDetails.balanceOfCToken,
                        vcNoteRouterAddress as `0x${string}`,
                        txDescription
                    )
                );
                // return tx list
                return NO_ERROR({ transactions: txList });
            }
        }
        /** push lending tx to list */
        txList.push(
            _lendingCTokenTx(
                txParams.txType,
                txParams.chainId,
                txParams.ethAccount,
                txParams.txType === CTokenLendingTxTypes.WITHDRAW ? vcNoteAmount : txParams.amount,
                vcNoteRouterAddress as `0x${string}`,
                txDescription
            )
        );

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
    const { data, error } = await getVivacityLMData(
        txParams.ethAccount,
        txParams.chainId,
    );
    if (error || !data.vcNote) {
        return NEW_ERROR("validateCTokenLendingRetryTxParams", error);
    }
    // validate with new position
    return NO_ERROR(
        validateCTokenLendingTxParams({
            ...txParams,
            cToken: data.vcNote,
        })
    );
}
