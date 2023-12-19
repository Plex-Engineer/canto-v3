import { CERC20_ABI, COMPTROLLER_ABI, RESERVOIR_ABI } from "@/config/abis";
import {
  CantoFETxType,
  Transaction,
  TransactionDescription,
} from "../interfaces";
import { CTokenLendingTxTypes } from ".";

export const _claimLendingRewardsTx = (
  chainId: number,
  userEthAdress: string,
  comptrollerAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.CLAIM_REWARDS_CLM,
  fromAddress: userEthAdress,
  chainId: chainId,
  type: "EVM",
  target: comptrollerAddress,
  abi: COMPTROLLER_ABI,
  method: "claimComp",
  params: [userEthAdress],
  value: "0",
});

// drip is called when claiming rewards, but the comptroller does not have enough WCANTO to pay
// called on reservoir contract, not comptroller
export const _dripComptrollerTx = (
  chainId: number,
  userEthAddress: string,
  reservoirAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.DRIP_COMPTROLLER,
  fromAddress: userEthAddress,
  chainId: chainId,
  type: "EVM",
  target: reservoirAddress,
  abi: RESERVOIR_ABI,
  method: "drip",
  params: [],
  value: "0",
});

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _lendingCTokenTx = (
  lendingTx: CTokenLendingTxTypes,
  chainId: number,
  userEthAddress: string,
  cTokenAddress: string,
  isCanto: boolean,
  amount: string,
  description: TransactionDescription
): Transaction => {
  const txDetails = methodAndParamsFromLendingTxType(
    lendingTx,
    amount,
    isCanto
  );
  return {
    description,
    feTxType: txDetails.feTxType,
    fromAddress: userEthAddress,
    chainId: chainId,
    type: "EVM",
    target: cTokenAddress,
    abi: CERC20_ABI,
    method: txDetails.method,
    params: txDetails.params,
    value: txDetails.value,
  };
};

// special function for withdrawing entire cToken balance (since it's a different method)
// only called when withdrawing entire balance
// uses cToken balance instead of underlying balance like the _lendingCTokenTx function
// redeemUnderlying may leave the user with very small amount of cTokens because of "accrueInterest"
export const _withdrawAllCTokenTx = (
  chainId: number,
  userEthAddress: string,
  cTokenAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.WITHDRAW_ALL,
  chainId: chainId,
  fromAddress: userEthAddress,
  type: "EVM",
  target: cTokenAddress,
  abi: CERC20_ABI,
  method: "redeem",
  params: [amount],
  value: "0",
});

export const _collateralizeTx = (
  chainId: number,
  userEthAddress: string,
  comptrollerAddress: string,
  cTokenAddress: string,
  collateralize: boolean,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: collateralize
    ? CantoFETxType.COLLATERALIZE
    : CantoFETxType.DECOLLATERALIZE,
  chainId: chainId,
  fromAddress: userEthAddress,
  type: "EVM",
  target: comptrollerAddress,
  abi: COMPTROLLER_ABI,
  method: collateralize ? "enterMarkets" : "exitMarket",
  params: collateralize ? [[cTokenAddress]] : [cTokenAddress],
  value: "0",
});

/**
 * @notice creates a transaction for lending
 * @param {CTokenLendingTxTypes} txType type of lending tx
 * @param {string} amount amount for tx
 * @param {boolean} isCanto whether or not to use canto
 */
function methodAndParamsFromLendingTxType(
  txType: CTokenLendingTxTypes,
  amount: string,
  isCanto: boolean
): {
  feTxType: CantoFETxType;
  method: string;
  params: string[];
  value: string;
} {
  switch (txType) {
    case CTokenLendingTxTypes.SUPPLY:
      return {
        feTxType: CantoFETxType.SUPPLY,
        method: "mint",
        params: isCanto ? [] : [amount],
        value: isCanto ? amount : "0",
      };
    case CTokenLendingTxTypes.BORROW:
      return {
        feTxType: CantoFETxType.BORROW,
        method: "borrow",
        params: [amount],
        value: "0",
      };
    case CTokenLendingTxTypes.REPAY:
      return {
        feTxType: CantoFETxType.REPAY,
        method: "repayBorrow",
        params: isCanto ? [] : [amount],
        value: isCanto ? amount : "0",
      };
    case CTokenLendingTxTypes.WITHDRAW:
      return {
        feTxType: CantoFETxType.WITHDRAW,
        method: "redeemUnderlying",
        params: [amount],
        value: "0",
      };
    default:
      throw new Error("Invalid tx type");
  }
}
