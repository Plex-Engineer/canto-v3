import { VCNoteWithUserData, CTokenLendingTxTypes } from ".";
import BigNumber from "bignumber.js";

export function maxAmountForLendingTx(
    txType: CTokenLendingTxTypes,
    cToken: VCNoteWithUserData,
  ): string {
    if (!cToken.userDetails) return "0";
    switch (txType) {
      case CTokenLendingTxTypes.SUPPLY:
        return  cToken.userDetails.balanceOfUnderlying ?? "0";
      case CTokenLendingTxTypes.WITHDRAW:
        return cToken.userDetails.balanceOfCToken ?? "0";
      default:
        return "0";
    }
  }

  export function maxAmountForLendingTxModal(
    txType: CTokenLendingTxTypes,
    cToken: VCNoteWithUserData,
  ): string {
    if (!cToken.userDetails) return "0";
    switch (txType) {
      case CTokenLendingTxTypes.SUPPLY:
        return  cToken.userDetails.balanceOfUnderlying ?? "0";
      case CTokenLendingTxTypes.WITHDRAW:
        return cToken.userDetails.supplyBalanceInUnderlying ?? "0";
      default:
        return "0";
    }
  }


/**
 * @notice Gets VCNote amount equivalent to given note amount
 * @param {string} amount amount of note
 * @param {string} exchangeRate exchange rate from vcNote to note
 * @returns {string}
 */
  export function getVCNoteAmountFromNote(amount : string, exchangeRate:string):string{
    const bnAmount = new BigNumber(amount)
    const bnExchangeRate = new BigNumber(exchangeRate)
    const bnVCNoteAmount = bnAmount.dividedBy(bnExchangeRate)
    return bnVCNoteAmount.toString()
  }
