import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { CantoDexTransactionParams, CantoDexTxTypes } from ".";
import {
  TX_DESCRIPTIONS,
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import {
  addTokenBalances,
  greaterThan,
  percentOfAmount,
  subtractTokenBalances,
  validateWeiUserInputTokenAmount,
} from "@/utils/math";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { createApprovalTxs } from "@/transactions/erc20";
import { areEqualAddresses, isValidEthAddress } from "@/utils/address";
import { getEVMTimestamp } from "@/utils/evm";
import {
  _addCantoDexLiquidityTx,
  _removeCantoDexLiquidityTx,
} from "./txCreators";
import { displayAmount } from "@/utils/formatting";
import { TransactionFlowType } from "@/transactions/flows";
import { CTokenLendingTxTypes, cTokenLendingTx } from "@/transactions/lending";
import { quoteRemoveLiquidity } from "@/utils/cantoDex";
import { getTokenBalance } from "@/utils/tokens";

export async function cantoDexLPTx(
  txParams: CantoDexTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    // validate params
    const validation = validateCantoDexLPTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    switch (txParams.txType) {
      case CantoDexTxTypes.ADD_LIQUIDITY:
        return await addLiquidity(txParams);
      case CantoDexTxTypes.REMOVE_LIQUIDITY:
        return await removeLiquidity(txParams);
      case CantoDexTxTypes.STAKE:
      case CantoDexTxTypes.UNSTAKE:
        return await stakeCantoDexLPTx(txParams);
      default:
        throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("Tx Type"));
    }
  } catch (err) {
    return NEW_ERROR("cantoDexLPTx", err);
  }
}

export function validateCantoDexLPTxParams(
  txParams: CantoDexTransactionParams
): Validation {
  // validate eth account
  if (!isValidEthAddress(txParams.ethAccount)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("Eth Account"),
    };
  }
  // make sure pair has user details
  if (!txParams.pair.clmData?.userDetails)
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_MISSING("User Details"),
    };
  // save user details to variable to stop repetition
  const pair = txParams.pair;
  const userDetails = txParams.pair.clmData.userDetails;
  // make sure balances are good depending on tx type
  switch (txParams.txType) {
    case CantoDexTxTypes.ADD_LIQUIDITY: {
      // check slippage and deadline
      if (Number(txParams.slippage) < 0 || Number(txParams.slippage) > 100) {
        return { error: true, reason: TX_PARAM_ERRORS.SLIPPAGE() };
      }
      if (Number(txParams.deadline) <= 0) {
        return { error: true, reason: TX_PARAM_ERRORS.DEADLINE() };
      }
      // get tokens
      const token1 = pair.token1;
      const token2 = pair.token2;
      // each token value must be less than or equal to their balance
      const [token1Check, token2Check] = [
        validateWeiUserInputTokenAmount(
          txParams.amounts.amount1,
          "1",
          token1.balance ?? "0",
          token1.symbol,
          token1.decimals
        ),
        validateWeiUserInputTokenAmount(
          txParams.amounts.amount2,
          "1",
          token2.balance ?? "0",
          token2.symbol,
          token2.decimals
        ),
      ];
      if (token1Check.error) return token1Check;
      return token2Check;
    }
    case CantoDexTxTypes.REMOVE_LIQUIDITY: {
      // check slippage and deadline
      if (Number(txParams.slippage) < 0 || Number(txParams.slippage) > 100) {
        return { error: true, reason: TX_PARAM_ERRORS.SLIPPAGE() };
      }
      if (Number(txParams.deadline) <= 0) {
        return { error: true, reason: TX_PARAM_ERRORS.DEADLINE() };
      }
      // add supply balance and underlying to make sure LP balance is enough
      return validateWeiUserInputTokenAmount(
        txParams.amountLP,
        "1",
        addTokenBalances(
          userDetails.supplyBalanceInUnderlying,
          userDetails.balanceOfUnderlying
        ),
        pair.symbol,
        pair.decimals
      );
    }
    case CantoDexTxTypes.STAKE:
      return validateWeiUserInputTokenAmount(
        txParams.amountLP,
        "1",
        userDetails.balanceOfUnderlying,
        pair.symbol,
        pair.decimals
      );
    case CantoDexTxTypes.UNSTAKE:
      return validateWeiUserInputTokenAmount(
        txParams.amountLP,
        "1",
        userDetails.supplyBalanceInUnderlying,
        pair.symbol,
        pair.decimals
      );
  }
}

/**
 * TRANSACTION FLOWS TO USE FROM MAIN LP FUNCTION
 */
async function addLiquidity(
  txParams: CantoDexTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** validate params */
    if (txParams.txType !== CantoDexTxTypes.ADD_LIQUIDITY)
      throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("Tx Type"));

    /** create tx list */
    const txList: Transaction[] = [];

    /** Allowance checks for Router */
    const routerAddress = getCantoCoreAddress(txParams.chainId, "router");
    if (!routerAddress) throw new Error("chainId not supported");

    const { data: alowanceTxs, error: allowanceError } =
      await createApprovalTxs(
        txParams.chainId,
        txParams.ethAccount,
        [
          {
            address: txParams.pair.token1.address,
            symbol: txParams.pair.token1.symbol,
          },
          {
            address: txParams.pair.token2.address,
            symbol: txParams.pair.token2.symbol,
          },
        ],
        [txParams.amounts.amount1, txParams.amounts.amount2],
        { address: routerAddress, name: "Router" }
      );
    if (allowanceError) throw allowanceError;

    /** add allowance txs to list */
    txList.push(...alowanceTxs);

    /** check if either token is canto */
    const wcantoAddress = getCantoCoreAddress(txParams.chainId, "wcanto");
    if (!wcantoAddress) throw new Error("chainId not supported");

    const [isToken1Canto, isToken2Canto] = [
      areEqualAddresses(txParams.pair.token1.address, wcantoAddress),
      areEqualAddresses(txParams.pair.token2.address, wcantoAddress),
    ];

    /** get min amounts for tokens and from quoting expected amounts */
    const [amount1Min, amount2Min] = [
      percentOfAmount(txParams.amounts.amount1, 100 - txParams.slippage),
      percentOfAmount(txParams.amounts.amount2, 100 - txParams.slippage),
    ];
    if (amount1Min.error || amount2Min.error)
      throw amount1Min.error ?? amount2Min.error;

    /** get deadline */
    const { data: timestamp, error: timestampError } = await getEVMTimestamp(
      txParams.chainId
    );
    if (timestampError) throw timestampError;
    const timeoutDeadline =
      timestamp + Math.floor(Number(txParams.deadline)) * 60;

    /** add liquidity tx */
    txList.push(
      _addCantoDexLiquidityTx(
        txParams.chainId,
        txParams.ethAccount,
        routerAddress,
        txParams.pair.token1.address,
        isToken1Canto,
        txParams.pair.token2.address,
        isToken2Canto,
        txParams.pair.stable,
        txParams.amounts.amount1,
        txParams.amounts.amount2,
        amount1Min.data,
        amount2Min.data,
        timeoutDeadline.toString(),
        TX_DESCRIPTIONS.ADD_LIQUIDITY(
          txParams.pair,
          displayAmount(
            txParams.amounts.amount1,
            txParams.pair.token1.decimals
          ),
          displayAmount(txParams.amounts.amount2, txParams.pair.token2.decimals)
        )
      )
    );

    /** check if also staking */
    if (txParams.stake) {
      // return as extra flow since we need to wait for the add liquidity tx to complete and make calculations
      return NO_ERROR({
        transactions: txList,
        extraFlow: {
          description: {
            title: "Stake LP Tokens",
            description: "Stake LP Tokens",
          },
          txFlowType: TransactionFlowType.CANTO_DEX_STAKE_LP_TX,
          params: txParams,
        },
      });
    }

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("addLiquidity", err);
  }
}

async function removeLiquidity(
  txParams: CantoDexTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** check params */
    if (txParams.txType !== CantoDexTxTypes.REMOVE_LIQUIDITY)
      throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("Tx Type"));

    if (!txParams.pair.clmData || !txParams.pair.clmData.userDetails)
      throw new Error(TX_PARAM_ERRORS.PARAM_MISSING("User Details"));

    /** get router address */
    const routerAddress = getCantoCoreAddress(txParams.chainId, "router");
    if (!routerAddress) throw new Error("chainId not supported");

    /** create tx list */
    const txList: Transaction[] = [];

    /** Possible Unstake */

    // check if the amount is greater than LP balance and unstake enough for tx
    const unstakeAmount = subtractTokenBalances(
      txParams.amountLP,
      txParams.pair.clmData.userDetails.balanceOfUnderlying
    );

    if (greaterThan(unstakeAmount, "0").data) {
      // make sure user has enough to unstake
      if (
        greaterThan(
          unstakeAmount,
          txParams.pair.clmData.userDetails.supplyBalanceInUnderlying
        ).data
      )
        throw new Error("user does not have enough LP to unstake");

      // remove LP from clm (can pass in position since LP tokens have no CF)
      const { data: withdrawTx, error: withdrawError } =
        await stakeCantoDexLPTx({
          ...txParams,
          amountLP: unstakeAmount,
        });
      if (withdrawError) throw withdrawError;
      txList.push(...withdrawTx.transactions);
    }

    /** Remove liquidity */

    /** Allowance check on lpToken for Router */
    const { data: allowanceTxs, error: allowanceError } =
      await createApprovalTxs(
        txParams.chainId,
        txParams.ethAccount,
        [
          {
            address: txParams.pair.address,
            symbol: txParams.pair.symbol,
          },
        ],
        [txParams.amountLP],
        { address: routerAddress, name: "Router" }
      );
    if (allowanceError) throw allowanceError;
    // push allowance txs to the list (might be none)
    txList.push(...allowanceTxs);

    /** check which tokens are canto (for choosing correct method on router) */
    const wcantoAddress = getCantoCoreAddress(txParams.chainId, "wcanto");
    if (!wcantoAddress) throw new Error("chainId not supported");
    const [isToken1Canto, isToken2Canto] = [
      areEqualAddresses(txParams.pair.token1.address, wcantoAddress),
      areEqualAddresses(txParams.pair.token2.address, wcantoAddress),
    ];

    /** get min amounts for tokens from quoting expected amounts */
    const { data: quote, error: quoteError } = await quoteRemoveLiquidity(
      txParams.chainId,
      routerAddress,
      txParams.pair.token1.address,
      txParams.pair.token2.address,
      txParams.pair.stable,
      txParams.amountLP
    );
    if (quoteError) throw quoteError;
    const [amount1Min, amount2Min] = [
      percentOfAmount(quote.expectedToken1, 100 - txParams.slippage),
      percentOfAmount(quote.expectedToken2, 100 - txParams.slippage),
    ];
    if (amount1Min.error || amount2Min.error)
      throw amount1Min.error ?? amount2Min.error;

    /** get deadline */
    const { data: timestamp, error: timestampError } = await getEVMTimestamp(
      txParams.chainId
    );
    if (timestampError) throw timestampError;
    const timeoutDeadline =
      timestamp + Math.floor(Number(txParams.deadline)) * 60;

    /** add remove liquidity tx to list */
    txList.push(
      _removeCantoDexLiquidityTx(
        txParams.chainId,
        txParams.ethAccount,
        routerAddress,
        txParams.pair.token1.address,
        isToken1Canto,
        txParams.pair.token2.address,
        isToken2Canto,
        txParams.pair.stable,
        txParams.amountLP,
        amount1Min.data,
        amount2Min.data,
        timeoutDeadline.toString(),
        TX_DESCRIPTIONS.REMOVE_LIQUIDITY(
          txParams.pair,
          displayAmount(txParams.amountLP, txParams.pair.decimals)
        )
      )
    );
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("removeLiquidity", err);
  }
}

// export this since used for extra tx flows
export async function stakeCantoDexLPTx(
  txParams: CantoDexTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** check params */

    // validate params
    const validation = validateCantoDexLPTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    if (!txParams.pair.clmData)
      throw new Error(TX_PARAM_ERRORS.PARAM_MISSING("Pair CLM Data"));
    /** get stake amount depending on txType*/
    let stakeAmount = "";
    let isStaking: boolean;
    switch (txParams.txType) {
      case CantoDexTxTypes.ADD_LIQUIDITY:
        // if add liquidity, stake the amount of LP tokens just received
        if (!txParams.pair.clmData?.userDetails)
          throw new Error(TX_PARAM_ERRORS.PARAM_MISSING("User Details"));

        const prevLPTokens =
          txParams.pair.clmData.userDetails.balanceOfUnderlying;
        const { data: currBalance, error: currBalanceError } =
          await getTokenBalance(
            txParams.chainId,
            txParams.pair.address,
            txParams.ethAccount
          );
        if (currBalanceError) throw currBalanceError;
        stakeAmount = currBalance.minus(prevLPTokens).toString();
        isStaking = true;
        // before calling withdraw, update the token balance in the txParams so lendingTx can use it
        txParams.pair.clmData.userDetails.balanceOfUnderlying =
          currBalance.toString();
        break;
      case CantoDexTxTypes.REMOVE_LIQUIDITY:
        isStaking = false;
        stakeAmount = txParams.amountLP;
        break;
      case CantoDexTxTypes.STAKE:
        isStaking = true;
        stakeAmount = txParams.amountLP;
        break;
      case CantoDexTxTypes.UNSTAKE:
        isStaking = false;
        stakeAmount = txParams.amountLP;
        break;
      default:
        throw new Error(TX_PARAM_ERRORS.PARAM_INVALID("Tx Type"));
    }
    /** return lending tx */
    // user position is not needed since LP tokens have no CF
    return await cTokenLendingTx({
      chainId: txParams.chainId,
      ethAccount: txParams.ethAccount,
      cToken: txParams.pair.clmData,
      max: true,
      amount: stakeAmount,
      txType: isStaking
        ? CTokenLendingTxTypes.SUPPLY
        : CTokenLendingTxTypes.WITHDRAW,
      userPosition: {
        avgApr: "0",
        liquidity: "0",
        shortfall: "0",
        totalBorrow: "0",
        totalSupply: "0",
        totalRewards: "0",
      },
    });
  } catch (err) {
    return NEW_ERROR("stakeCantoDexLPTx", err);
  }
}
