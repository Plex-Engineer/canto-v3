import { DEX_REOUTER_ABI } from "@/config/abis";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
  errMsg,
} from "@/config/interfaces";
import {
  PairsTransactionParams,
  PairsTxTypes,
  StakeLPParams,
} from "../interfaces/pairsTxTypes";
import { cTokenLendingTx } from "@/hooks/lending/transactions/lending";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { createApprovalTxs, getTokenBalance } from "@/utils/evm/erc20.utils";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { getCLMAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address.utils";
import { percentOfAmount } from "@/utils/tokens/tokenMath.utils";
import { quoteRemoveLiquidity } from "@/utils/evm/pairs.utils";
import { TransactionFlowType } from "@/config/transactions/txMap";

export async function lpPairTx(
  params: PairsTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // make sure pair passed through has user details
  if (!params.pair.clmData) {
    return NEW_ERROR("lpPairTx: pair does not have user details");
  }
  // get router address to use for transaction
  const routerAddress = getCLMAddress(params.chainId, "router");
  if (!routerAddress) {
    return NEW_ERROR(
      "lpPairTx: could not get router address for chainId" + params.chainId
    );
  }
  switch (params.txType) {
    case PairsTxTypes.STAKE:
    case PairsTxTypes.UNSTAKE:
      // if this is only a lending action (supply/withdraw), then call on that function instead
      return await stakeLPFlow({
        chainId: params.chainId,
        ethAccount: params.ethAccount,
        cLPToken: params.pair.clmData,
        stake: params.txType === PairsTxTypes.STAKE,
        amount: params.amountLP,
      });
    case PairsTxTypes.ADD_LIQUIDITY:
      return await addLiquidityFlow(params, routerAddress);
    case PairsTxTypes.REMOVE_LIQUIDITY:
      return await removeLiquidityFlow(params, routerAddress);
    default:
      return NEW_ERROR("lpPairTx: incorrect tx type passed");
  }
}

/**
 * TRANSACTION FLOWS TO USE FROM MAIN LP FUNCTION
 */
async function addLiquidityFlow(
  params: PairsTransactionParams,
  routerAddress: string
): PromiseWithError<TxCreatorFunctionReturn> {
  /** check params */
  // check that the correct tx is being passed
  if (params.txType !== PairsTxTypes.ADD_LIQUIDITY) {
    return NEW_ERROR("addLiquidityFlow: incorrect tx type passed");
  }
  /** create tx list */
  const txList: Transaction[] = [];

  /** Allowance check on tokens for Router */
  const { data: allowanceTxs, error: allowanceError } = await createApprovalTxs(
    params.chainId,
    params.ethAccount,
    [
      {
        address: params.pair.token1.address,
        symbol: params.pair.token1.symbol,
      },
      {
        address: params.pair.token2.address,
        symbol: params.pair.token2.symbol,
      },
    ],
    [params.amounts.amount1, params.amounts.amount2],
    { address: routerAddress, name: "Router" }
  );
  if (allowanceError) {
    return NEW_ERROR("addLiquidityFlow: " + errMsg(allowanceError));
  }

  // push allowance txs to the list (might be none)
  txList.push(...allowanceTxs);

  /** check which tokens are canto (for choosing correct method on router) */
  const wcantoAddress = getCLMAddress(params.chainId, "wcanto");
  if (!wcantoAddress) {
    return NEW_ERROR(
      "removeLiquidityFlow: could not get wcanto address for chainId" +
        params.chainId
    );
  }
  const [isToken1Canto, isToken2Canto] = [
    areEqualAddresses(params.pair.token1.address, wcantoAddress),
    areEqualAddresses(params.pair.token2.address, wcantoAddress),
  ];

  /** get min amounts for tokens from quoting expected amounts */
  const [amount1Min, amount2Min] = [
    percentOfAmount(params.amounts.amount1, 100 - params.slippage),
    percentOfAmount(params.amounts.amount2, 100 - params.slippage),
  ];
  if (amount1Min.error || amount2Min.error) {
    return NEW_ERROR(
      "addLiquidityFlow: " +
        errMsg(amount1Min.error ?? amount2Min.error) +
        " while calculating min amounts"
    );
  }

  /** add add liquidity tx to list */
  txList.push(
    _addLiquidityTx(
      params.chainId,
      params.ethAccount,
      routerAddress,
      params.pair.token1.address,
      isToken1Canto,
      params.pair.token2.address,
      isToken2Canto,
      params.pair.stable,
      params.amounts.amount1,
      params.amounts.amount2,
      amount1Min.data,
      amount2Min.data,
      params.deadline,
      TX_DESCRIPTIONS.ADD_LIQUIDITY(
        params.pair,
        params.amounts.amount1,
        params.amounts.amount2
      )
    )
  );

  // check if staking is needed
  if (params.stake) {
    // return extra staking flow, since we don't have the balance yet
    return NO_ERROR({
      transactions: txList,
      extraFlow: {
        description: {
          title: "Stake LP Tokens",
          description: "Stake LP Tokens",
        },
        txFlowType: TransactionFlowType.STAKE_LP_TX,
        params: {
          chainId: params.chainId,
          ethAccount: params.ethAccount,
          cLPToken: params.pair.clmData,
          stake: true,
        },
      },
    });
  }

  return NO_ERROR({ transactions: txList });
}

async function removeLiquidityFlow(
  params: PairsTransactionParams,
  routerAddress: string
): PromiseWithError<TxCreatorFunctionReturn> {
  /** check params */
  // check that the correct tx is being passed
  if (params.txType !== PairsTxTypes.REMOVE_LIQUIDITY) {
    return NEW_ERROR("removeLiquidityFlow: incorrect tx type passed");
  }
  // check for user details
  if (!params.pair.clmData) {
    return NEW_ERROR("removeLiquidityFlow: pair does not have user details");
  }
  /** create tx list */
  const txList: Transaction[] = [];

  /** Unstake */
  if (params.unstake) {
    // remove LP from clm
    const { data: withdrawTx, error: withdrawError } = await cTokenLendingTx({
      chainId: params.chainId,
      ethAccount: params.ethAccount,
      txType: CTokenLendingTxTypes.WITHDRAW,
      cToken: params.pair.clmData,
      amount: params.amountLP,
    });
    if (withdrawError) {
      return NEW_ERROR("removeLiquidityFlow: " + errMsg(withdrawError));
    }
    txList.push(...withdrawTx.transactions);
  }

  /** Remove liquidity */

  /** Allowance check on lpToken for Router */
  const { data: allowanceTxs, error: allowanceError } = await createApprovalTxs(
    params.chainId,
    params.ethAccount,
    [
      {
        address: params.pair.address,
        symbol: params.pair.symbol,
      },
    ],
    [params.amountLP],
    { address: routerAddress, name: "Router" }
  );
  if (allowanceError) {
    return NEW_ERROR("addLiquidityFlow: " + errMsg(allowanceError));
  }
  // push allowance txs to the list (might be none)
  txList.push(...allowanceTxs);

  /** check which tokens are canto (for choosing correct method on router) */
  const wcantoAddress = getCLMAddress(params.chainId, "wcanto");
  if (!wcantoAddress) {
    return NEW_ERROR(
      "removeLiquidityFlow: could not get wcanto address for chainId" +
        params.chainId
    );
  }
  const [isToken1Canto, isToken2Canto] = [
    areEqualAddresses(params.pair.token1.address, wcantoAddress),
    areEqualAddresses(params.pair.token2.address, wcantoAddress),
  ];

  /** get min amounts for tokens from quoting expected amounts */
  const { data: quote, error: quoteError } = await quoteRemoveLiquidity(
    params.chainId,
    routerAddress,
    params.pair.token1.address,
    params.pair.token2.address,
    params.pair.stable,
    params.amountLP
  );
  if (quoteError) {
    return NEW_ERROR("removeLiquidityFlow: " + errMsg(quoteError));
  }
  const [amount1Min, amount2Min] = [
    percentOfAmount(quote.expectedToken1, 100 - params.slippage),
    percentOfAmount(quote.expectedToken2, 100 - params.slippage),
  ];
  if (amount1Min.error || amount2Min.error) {
    return NEW_ERROR(
      "removeLiquidityFlow: " +
        errMsg(amount1Min.error ?? amount2Min.error) +
        " while calculating min amounts"
    );
  }

  /** add remove liquidity tx to list */
  txList.push(
    _removeLiquidityTx(
      params.chainId,
      params.ethAccount,
      routerAddress,
      params.pair.token1.address,
      isToken1Canto,
      params.pair.token2.address,
      isToken2Canto,
      params.pair.stable,
      params.amountLP,
      amount1Min.data,
      amount2Min.data,
      params.deadline,
      TX_DESCRIPTIONS.REMOVE_LIQUIDITY(params.pair, params.amountLP)
    )
  );
  return NO_ERROR({ transactions: txList });
}

// this is exported since it will be used during extra transaction flows
export async function stakeLPFlow(
  params: StakeLPParams
): PromiseWithError<TxCreatorFunctionReturn> {
  let stakeAmount = "";
  if (params.stake && !params.amount) {
    // make sure user details are here
    if (!params.cLPToken.userDetails) {
      return NEW_ERROR(
        "stakeLPFlow: user details not found for cLPToken " +
          params.cLPToken.symbol
      );
    }
    // we only want to stake the amount of LP tokens the the user just received
    const prevLPTokens = params.cLPToken.userDetails.balanceOfUnderlying;
    const { data: currLPTokens, error } = await getTokenBalance(
      params.chainId,
      params.cLPToken.underlying.address,
      params.ethAccount
    );
    if (error) {
      return NEW_ERROR("stakeLPFlow: " + errMsg(error));
    }
    stakeAmount = currLPTokens.minus(prevLPTokens).toString();
  } else {
    stakeAmount = params.amount ?? "0";
  }
  return await cTokenLendingTx({
    chainId: params.chainId,
    ethAccount: params.ethAccount,
    txType: params.stake
      ? CTokenLendingTxTypes.SUPPLY
      : CTokenLendingTxTypes.WITHDRAW,
    cToken: params.cLPToken,
    amount: stakeAmount,
  });
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _addLiquidityTx = (
  chainId: number,
  ethAccount: string,
  routerAddress: string,
  token1Address: string,
  isToken1Canto: boolean,
  token2Address: string,
  isToken2Canto: boolean,
  stable: boolean,
  amount1: string,
  amount2: string,
  amount1Min: string,
  amount2Min: string,
  deadline: number,
  description: TransactionDescription
): Transaction => {
  const cantoInPair = isToken1Canto || isToken2Canto;
  return {
    description,
    chainId: chainId,
    type: "EVM",
    target: routerAddress,
    abi: DEX_REOUTER_ABI,
    method: cantoInPair ? "addLiquidityCANTO" : "addLiquidity",
    params: cantoInPair
      ? [
          isToken1Canto ? token2Address : token1Address,
          stable,
          isToken1Canto ? amount2 : amount1,
          isToken1Canto ? amount2Min : amount1Min,
          isToken1Canto ? amount1Min : amount2Min,
          ethAccount,
          deadline,
        ]
      : [
          token1Address,
          token2Address,
          stable,
          amount1,
          amount2,
          amount1Min,
          amount2Min,
          ethAccount,
          deadline,
        ],
    value: isToken1Canto ? amount1 : isToken2Canto ? amount2 : "0",
  };
};
const _removeLiquidityTx = (
  chainId: number,
  ethAccount: string,
  routerAddress: string,
  token1Address: string,
  isToken1Canto: boolean,
  token2Address: string,
  isToken2Canto: boolean,
  stable: boolean,
  amountLP: string,
  amount1Min: string,
  amount2Min: string,
  deadline: number,
  description: TransactionDescription
): Transaction => {
  const cantoInPair = isToken1Canto || isToken2Canto;
  return {
    description,
    chainId: chainId,
    type: "EVM",
    target: routerAddress,
    abi: DEX_REOUTER_ABI,
    method: cantoInPair ? "removeLiquidityCANTO" : "removeLiquidity",
    params: cantoInPair
      ? [
          isToken1Canto ? token2Address : token1Address,
          stable,
          amountLP,
          isToken1Canto ? amount2Min : amount1Min,
          isToken1Canto ? amount1Min : amount2Min,
          ethAccount,
          deadline,
        ]
      : [
          token1Address,
          token2Address,
          stable,
          amountLP,
          amount1Min,
          amount2Min,
          ethAccount,
          deadline,
        ],
    value: "0",
  };
};
