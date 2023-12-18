import { getCantoCoreAddress } from "@/config/consts/addresses";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
  CTokenLendingTxTypes,
} from ".";
import { NewTransactionFlow, TransactionFlowType } from "../flows";

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
    txType: TransactionFlowType.CLM_CTOKEN_TX,
    params: txParams,
    tokenMetadata,
  };
};

export const newClaimCLMRewardsFlow = (
  txParams: CLMClaimRewardsTxParams
): NewTransactionFlow => {
  // wcanto for rewards
  const wCantoAddress = getCantoCoreAddress(txParams.chainId, "wcanto");
  return {
    title: "Claim CLM Rewards",
    icon: "/icons/canto.svg",
    txType: TransactionFlowType.CLM_CLAIM_REWARDS_TX,
    params: txParams,
    tokenMetadata: wCantoAddress
      ? [
          {
            chainId: txParams.chainId,
            address: wCantoAddress,
            symbol: "wCANTO",
            decimals: 18,
            icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
          },
        ]
      : undefined,
  };
};
