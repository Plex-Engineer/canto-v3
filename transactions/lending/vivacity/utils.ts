import { VCNoteWithUserData, CTokenLendingTxTypes } from ".";
import BigNumber from "bignumber.js";

export function maxAmountForLendingTx(
  txType: CTokenLendingTxTypes,
  cToken: VCNoteWithUserData
): string {
  if (!cToken.userDetails) return "0";
  switch (txType) {
    case CTokenLendingTxTypes.SUPPLY:
      return cToken.userDetails.balanceOfUnderlying ?? "0";
    case CTokenLendingTxTypes.WITHDRAW:
      return cToken.userDetails.supplyBalanceInUnderlying ?? "0";
    default:
      return "0";
  }
}

/**
 * @notice Gets VCNote amount equivalent to given note amount
 * @param {string} noteAmount amount of note
 * @param {string} exchangeRate exchange rate from vcNote to note
 * @param {string} vcNoteBalance balance of vcNote
 * @returns {string}
 */
export function getVCNoteAmountFromNote(
  noteAmount: string,
  exchangeRate: string,
  vcNoteBalance: string
): string {
  const bnNoteAmount = new BigNumber(noteAmount);
  const bnExchangeRate = new BigNumber(exchangeRate);
  const bnVCNoteBalance = new BigNumber(vcNoteBalance);
  let bnVCNoteAmount = bnNoteAmount.dividedBy(bnExchangeRate);
  bnVCNoteAmount = bnVCNoteAmount.integerValue(BigNumber.ROUND_UP);
  if (bnVCNoteAmount.isGreaterThan(bnVCNoteBalance)) {
    bnVCNoteAmount = bnVCNoteBalance;
  }
  return bnVCNoteAmount.toString();
}
