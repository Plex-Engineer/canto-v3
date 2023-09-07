import {
  Transaction,
  TransactionDescription,
} from "@/config/interfaces/transactions";
import {
  CTokenLendingTransactionParams,
  CTokenLendingTxTypes,
} from "../interfaces/lendingTxTypes";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { _approveTx, checkTokenAllowance } from "@/utils/evm/erc20.utils";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { formatBalance } from "@/utils/tokenBalances.utils";
import { CERC20_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { CANTO_MAINNET_EVM } from "@/config/networks";
import { COMPTROLLER_ADDRESS_CANTO_MAINNET } from "@/config/consts/addresses";

export async function cTokenLendingTx(
  params: CTokenLendingTransactionParams
): PromiseWithError<Transaction[]> {
  // make sure CToken passed through has user details
  if (!params.cToken.userDetails) {
    return NEW_ERROR("cTokenLendingTx: cToken does not have user details");
  }
  // check if collateralizing tx
  if (
    params.type === CTokenLendingTxTypes.COLLATERALIZE ||
    params.type === CTokenLendingTxTypes.DECOLLATERALIZE
  ) {
    // get comptroller address
    let comptrollerAddress;
    if (params.chainId === CANTO_MAINNET_EVM.chainId) {
      comptrollerAddress = COMPTROLLER_ADDRESS_CANTO_MAINNET;
    } else {
      return NEW_ERROR("cTokenLendingTx: chainId not supported");
    }
    const isCollateralize = params.type === CTokenLendingTxTypes.COLLATERALIZE;
    return NO_ERROR([
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
    ]);
  }
  // lending action
  // create tx list
  const txList: Transaction[] = [];
  // check to see if token is cCanto
  const isCanto = params.cToken.symbol === "cCANTO";

  // check to see if we need to enable token (only for supplying and repaying)
  if (
    !isCanto &&
    (params.type === CTokenLendingTxTypes.SUPPLY ||
      params.type === CTokenLendingTxTypes.REPAY)
  ) {
    // check if we need to approve token
    const { data: needAllowance, error: allowanceError } =
      await checkTokenAllowance(
        params.chainId,
        params.cToken.underlying.address,
        params.ethAccount,
        params.cToken.address,
        params.amount
      );
    if (allowanceError) {
      return NEW_ERROR("cTokenLendingTx::" + errMsg(allowanceError));
    }
    if (needAllowance) {
      txList.push(
        _approveTx(
          params.chainId,
          params.cToken.underlying.address,
          params.cToken.address,
          params.amount,
          TX_DESCRIPTIONS.APPROVE_TOKEN(
            params.cToken.underlying.symbol,
            "Lending Market"
          )
        )
      );
    }
  }
  // create tx for lending
  txList.push(
    _lendingCTokenTx(
      params.type,
      params.chainId,
      params.cToken.address,
      isCanto,
      params.amount,
      TX_DESCRIPTIONS.CTOKEN_LENDING(
        params.type,
        params.cToken.underlying.symbol,
        formatBalance(params.amount, params.cToken.underlying.decimals)
      )
    )
  );
  return NO_ERROR(txList);
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
        method: "redeem",
        params: [amount],
        value: "0",
      };
    default:
      throw new Error("Invalid tx type");
  }
}
