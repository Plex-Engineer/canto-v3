import {
  CTokenLendingTransactionParams,
  CTokenLendingTxTypes,
  ClaimRewardsTxParams,
} from ".";
import { NewTransactionFlow, TransactionFlowType } from "../../flows";

export const newCTokenLendingFlow = (
  txParams: CTokenLendingTransactionParams
): NewTransactionFlow => {
  const tokenMetadata =
    txParams.txType === CTokenLendingTxTypes.SUPPLY
      ? [
          {
            chainId: txParams.chainId,
            address: txParams.cToken.address,
            symbol: txParams.cToken.symbol,
            decimals: txParams.cToken.decimals,
            icon: txParams.cToken.underlying.logoURI,
          },
        ]
      : [
          {
            chainId: txParams.chainId,
            address: txParams.cToken.underlying.address,
            symbol: txParams.cToken.underlying.symbol,
            decimals: txParams.cToken.underlying.decimals,
            icon: txParams.cToken.underlying.logoURI,
          },
        ];
  return {
    title: txParams.txType + " " + txParams.cToken.underlying.symbol,
    icon: txParams.cToken.underlying.logoURI,
    txType: TransactionFlowType.VIVACITY_CTOKEN_TX,
    params: txParams,
    tokenMetadata,
  };
};

export const newClaimRewardsFlow = (
  txParams: ClaimRewardsTxParams
): NewTransactionFlow => {
  return {
    title: "Claim Vivacity Rewards",
    icon: "/icons/canto.svg",
    txType: TransactionFlowType.VIVACITY_CLAIM_REWARDS_TX,
    params: txParams,
  };
};
