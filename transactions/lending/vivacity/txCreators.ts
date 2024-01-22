import { VCNOTE_ROUTER_ABI } from "@/config/abis";
import {
  CantoFETxType,
  Transaction,
  TransactionDescription,
} from "../../interfaces";
import { CTokenLendingTxTypes } from "../";

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _lendingCTokenTx = (
  lendingTx: CTokenLendingTxTypes,
  chainId: number,
  userEthAddress: string,
  amount: string,
  vcNoteRouterAddress: string,
  description: TransactionDescription
): Transaction => {
  const txDetails = methodAndParamsFromLendingTxType(
    lendingTx,
    amount,
  );
  return {
    description,
    feTxType: txDetails.feTxType,
    fromAddress: userEthAddress,
    chainId: chainId,
    type: "EVM",
    target: vcNoteRouterAddress,
    abi: VCNOTE_ROUTER_ABI,
    method: txDetails.method,
    params: txDetails.params,
    value: txDetails.value,
  };
};

// special function for withdrawing entire cToken balance (since it's a different method)
// only called when withdrawing entire balance
// uses cToken balance instead of underlying balance like the _lendingCTokenTx function
export const _withdrawAllCTokenTx = (
  chainId: number,
  userEthAddress: string,
  amount: string,
  vcNoteRouterAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.WITHDRAW_ALL,
  chainId: chainId,
  fromAddress: userEthAddress,
  type: "EVM",
  target: vcNoteRouterAddress,
  abi: VCNOTE_ROUTER_ABI,
  method: "redeem",
  params: [amount],
  value: "0",
});


/**
 * @notice creates a transaction for lending
 * @param {CTokenLendingTxTypes} txType type of lending tx
 * @param {string} amount amount for tx
 */
function methodAndParamsFromLendingTxType(
  txType: CTokenLendingTxTypes,
  amount: string,
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
        params: [amount],
        value: "0",
      };
    case CTokenLendingTxTypes.WITHDRAW:
      return {
        feTxType: CantoFETxType.WITHDRAW,
        method: "redeem",
        params: [amount],
        value: "0",
      };
    default:
      throw new Error("Invalid tx type");
  }
}
