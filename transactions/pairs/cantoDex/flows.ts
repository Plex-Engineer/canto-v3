import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { CantoDexTransactionParams, CantoDexTxTypes } from ".";

/**
 * @notice Creates a new transaction flow for pairs
 * @param {CantoDexTransactionParams} txParams - The parameters to create a new transaction flow
 * @returns {NewTransactionFlow} New transaction flow
 */
export const newCantoDexLPFlow = (
  txParams: CantoDexTransactionParams
): NewTransactionFlow => {
  return {
    title: txParams.txType + " " + txParams.pair.symbol,
    icon: txParams.pair.logoURI,
    txType: TransactionFlowType.CANTO_DEX_LP_TX,
    params: txParams,
    tokenMetadata: tokenMetadata(txParams),
  };
};

const tokenMetadata = (txParams: CantoDexTransactionParams) => {
  const pair = txParams.pair;
  const lpToken = {
    chainId: txParams.chainId,
    address: pair.address,
    symbol: pair.symbol,
    decimals: pair.decimals,
    icon: pair.logoURI,
  };
  const cLPToken = pair.clmData
    ? {
        chainId: txParams.chainId,
        address: pair.clmData.address,
        symbol: pair.clmData.symbol,
        decimals: pair.clmData.decimals,
        icon: pair.clmData.underlying.logoURI,
      }
    : null;

  switch (txParams.txType) {
    case CantoDexTxTypes.ADD_LIQUIDITY:
      // add cLPToken if staking, otherwise add LP token
      return txParams.stake ? (cLPToken ? [cLPToken] : undefined) : [lpToken];
    case CantoDexTxTypes.STAKE:
      // just add cLPToken
      return cLPToken ? [cLPToken] : undefined;
    case CantoDexTxTypes.UNSTAKE:
      // add LP token
      return [lpToken];
    case CantoDexTxTypes.REMOVE_LIQUIDITY:
      // add both underlying tokens to the pair
      return [
        {
          chainId: txParams.chainId,
          address: pair.token1.address,
          symbol: pair.token1.symbol,
          decimals: pair.token1.decimals,
          icon: pair.token1.logoURI,
        },
        {
          chainId: txParams.chainId,
          address: pair.token2.address,
          symbol: pair.token2.symbol,
          decimals: pair.token2.decimals,
          icon: pair.token2.logoURI,
        },
      ];
    default:
      return undefined;
  }
};
