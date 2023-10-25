import {
  Transaction,
  TransactionDescription,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
  TxCreatorFunctionReturn,
} from "@/config/interfaces";
import {
  CTokenLendingTransactionParams,
  CTokenLendingTxTypes,
} from "../interfaces/lendingTxTypes";
import { createApprovalTxs } from "@/utils/evm/erc20.utils";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { displayAmount } from "@/utils/tokenBalances.utils";
import { CERC20_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { MAX_UINT256, getCantoCoreAddress } from "@/config/consts/addresses";
import { greaterThan } from "@/utils/tokens/tokenMath.utils";

export async function cTokenLendingTx(
  params: CTokenLendingTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // make sure CToken passed through has user details
  if (!params.cToken.userDetails) {
    return NEW_ERROR("cTokenLendingTx: cToken does not have user details");
  }
  // check if collateralizing tx
  if (
    params.txType === CTokenLendingTxTypes.COLLATERALIZE ||
    params.txType === CTokenLendingTxTypes.DECOLLATERALIZE
  ) {
    // get comptroller address
    const comptrollerAddress = getCantoCoreAddress(
      params.chainId,
      "comptroller"
    );
    if (!comptrollerAddress) {
      return NEW_ERROR("cTokenLendingTx: chainId not supported");
    }
    const isCollateralize =
      params.txType === CTokenLendingTxTypes.COLLATERALIZE;
    return NO_ERROR({
      transactions: [
        _collateralizeTx(
          params.chainId,
          comptrollerAddress,
          params.cToken.address,
          isCollateralize,
          TX_DESCRIPTIONS.CTOKEN_COLLATERALIZE(
            params.cToken.underlying.symbol,
            isCollateralize
          )
        ),
      ],
    });
  }
  // lending action
  // create tx list
  const txList: Transaction[] = [];
  // check to see if token is cCanto
  const isCanto = params.cToken.symbol === "cCANTO";

  // check to see if we need to enable token (only for supplying and repaying)
  if (
    !isCanto &&
    (params.txType === CTokenLendingTxTypes.SUPPLY ||
      params.txType === CTokenLendingTxTypes.REPAY)
  ) {
    // check if we need to approve token
    const { data: allowanceTxs, error: allowanceError } =
      await createApprovalTxs(
        params.chainId,
        params.ethAccount,
        [
          {
            address: params.cToken.underlying.address,
            symbol: params.cToken.underlying.symbol,
          },
        ],
        [params.amount],
        { address: params.cToken.address, name: "Lending Market" }
      );
    if (allowanceError) {
      return NEW_ERROR("addLiquidityFlow: " + errMsg(allowanceError));
    }
    // push allowance txs to the list (might be none)
    txList.push(...allowanceTxs);
  }
  // create tx for lending
  const txDescription = TX_DESCRIPTIONS.CTOKEN_LENDING(
    params.txType,
    params.cToken.underlying.symbol,
    displayAmount(params.amount, params.cToken.underlying.decimals)
  );

  // check if max was clicked
  if (params.max) {
    // check to see if tx is withdrawing entire balance
    if (
      params.txType === CTokenLendingTxTypes.WITHDRAW &&
      params.cToken.userDetails.supplyBalanceInUnderlying === params.amount
    ) {
      // push special withdraw all function, passing in the cToken balance instead
      txList.push(
        _withdrawAllCTokenTx(
          params.chainId,
          params.cToken.address,
          params.cToken.userDetails.balanceOfCToken,
          txDescription
        )
      );
      return NO_ERROR({ transactions: txList });
    }
    // check to see if repaying entire balance
    if (
      params.txType === CTokenLendingTxTypes.REPAY &&
      greaterThan(
        params.cToken.userDetails.balanceOfUnderlying,
        params.cToken.userDetails.borrowBalance
      ).data
    ) {
      // change amount to max uint
      params.amount = MAX_UINT256;
    }
  }

  // push normal clm tx using underlying balance
  txList.push(
    _lendingCTokenTx(
      params.txType,
      params.chainId,
      params.cToken.address,
      isCanto,
      params.amount,
      txDescription
    )
  );

  // user should enable token as collateral if supplying and token has collateral factor
  if (
    params.txType === CTokenLendingTxTypes.SUPPLY &&
    !params.cToken.userDetails.isCollateral &&
    Number(params.cToken.collateralFactor) !== 0
  ) {
    // get comptroller address
    const comptrollerAddress = getCantoCoreAddress(
      params.chainId,
      "comptroller"
    );
    if (!comptrollerAddress) {
      return NEW_ERROR("cTokenLendingTx: chainId not supported");
    }
    txList.push(
      _collateralizeTx(
        params.chainId,
        comptrollerAddress,
        params.cToken.address,
        true,
        TX_DESCRIPTIONS.CTOKEN_COLLATERALIZE(
          params.cToken.underlying.symbol,
          true
        )
      )
    );
  }
  return NO_ERROR({ transactions: txList });
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _lendingCTokenTx = (
  lendingTx: CTokenLendingTxTypes,
  chainId: number,
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
const _withdrawAllCTokenTx = (
  chainId: number,
  cTokenAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: cTokenAddress,
  abi: CERC20_ABI,
  method: "redeem",
  params: [amount],
  value: "0",
});

const _collateralizeTx = (
  chainId: number,
  comptrollerAddress: string,
  cTokenAddress: string,
  collateralize: boolean,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: comptrollerAddress,
  abi: COMPTROLLER_ABI,
  method: collateralize ? "enterMarkets" : "exitMarket",
  params: collateralize ? [[cTokenAddress]] : [cTokenAddress],
  value: "0",
});

/**
 * TRANSACTION HELPERS
 */

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
  method: string;
  params: string[];
  value: string;
} {
  switch (txType) {
    case CTokenLendingTxTypes.SUPPLY:
      return {
        method: "mint",
        params: isCanto ? [] : [amount],
        value: isCanto ? amount : "0",
      };
    case CTokenLendingTxTypes.BORROW:
      return {
        method: "borrow",
        params: [amount],
        value: "0",
      };
    case CTokenLendingTxTypes.REPAY:
      return {
        method: "repayBorrow",
        params: isCanto ? [] : [amount],
        value: isCanto ? amount : "0",
      };
    case CTokenLendingTxTypes.WITHDRAW:
      return {
        method: "redeemUnderlying",
        params: [amount],
        value: "0",
      };
    default:
      throw new Error("Invalid tx type");
  }
}

/**
 * @notice validates the parameters for a lending market cToken transaction
 * @param {CTokenLendingTransactionParams} params parameters for lending tx
 * @returns {PromiseWithError<{valid: boolean, error?: string}>} whether the parameters are valid or not
 */
export async function validateCTokenLendingRetryParams(
  params: CTokenLendingTransactionParams
): PromiseWithError<{
  valid: boolean;
  error?: string;
}> {
  return NO_ERROR({ valid: true });
}
