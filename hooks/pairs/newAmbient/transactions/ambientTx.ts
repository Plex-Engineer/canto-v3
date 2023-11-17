import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
  errMsg,
} from "@/config/interfaces";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "../interfaces/ambientPoolTxTypes";
import {
  convertToQ64RootPrice,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  roundLiquidityForAmbientTx,
} from "@/utils/ambient";
import { getAmbientAddress } from "../config/addresses";
import { createApprovalTxs } from "@/utils/tokens";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { AMBIENT_REWARD_LEDGER_ABI, CROC_SWAP_DEX_ABI } from "@/config/abis";
import { eth } from "web3";
import { percentOfAmount } from "@/utils/math";
import { displayAmount } from "@/utils/formatting";
import { CLMClaimRewardsTxParams } from "@/transactions/lending";

export async function ambientLiquidityTx(
  params: AmbientTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // do all conversions here to pass into flows
  const minPriceQ64 = convertToQ64RootPrice(params.minPriceWei);
  const maxPriceQ64 = convertToQ64RootPrice(params.maxPriceWei);

  // get croc dex address
  const crocDexAddress = getAmbientAddress(params.chainId, "crocDex");
  if (!crocDexAddress) {
    return NEW_ERROR("Ambient liquidity tx:: Invalid chain id");
  }
  switch (params.txType) {
    case AmbientTxType.ADD_CONC_LIQUIDITY:
      return await addConcLiquidityFlow({
        ...params,
        crocDexAddress,
        minPriceWei: params.minPriceWei,
        maxPriceWei: params.maxPriceWei,
        minPriceQ64,
        maxPriceQ64,
      });
    case AmbientTxType.REMOVE_CONC_LIQUIDITY:
      // there is nothing to check for allowances or other details
      // return tx here
      return NO_ERROR({
        transactions: [
          _removeConcLiquidityTx(
            params.chainId,
            crocDexAddress,
            params.pool.base.address,
            params.pool.quote.address,
            params.pool.poolIdx,
            params.liquidity,
            params.lowerTick,
            params.upperTick,
            minPriceQ64,
            maxPriceQ64,
            TX_DESCRIPTIONS.REMOVE_AMBIENT_CONC_LIQ()
          ),
        ],
      });
    default:
      return NEW_ERROR("Invalid transaction type");
  }
}

export function claimAmbientRewardsTx(
  txParams: CLMClaimRewardsTxParams
): ReturnWithError<TxCreatorFunctionReturn> {
  const rewardsLedgerAddress = getAmbientAddress(
    txParams.chainId,
    "rewardLedger"
  );
  if (!rewardsLedgerAddress) {
    return NEW_ERROR("claimAmbientRewardsTx:: Invalid chain id");
  }
  return NO_ERROR({
    transactions: [
      _ambientClaimRewardsTx(
        txParams.chainId,
        rewardsLedgerAddress,
        TX_DESCRIPTIONS.CLAIM_REWARDS(
          displayAmount(txParams.estimatedRewards, 18),
          "CANTO",
          "Ambient"
        )
      ),
    ],
  });
}

/**
 * TRANSACTION FLOWS TO USE FROM MAIN LP FUNCTION
 */
type AmbientFlowParams = AmbientTransactionParams & {
  crocDexAddress: string;
  minPriceWei: string;
  minPriceQ64: string;
  maxPriceWei: string;
  maxPriceQ64: string;
};
async function addConcLiquidityFlow(
  params: AmbientFlowParams
): PromiseWithError<TxCreatorFunctionReturn> {
  /** check for correct tx type */
  if (params.txType !== AmbientTxType.ADD_CONC_LIQUIDITY) {
    return NEW_ERROR("addConcLiquidityFlow:: Invalid transaction type");
  }
  /** create tx list */
  const txList: Transaction[] = [];

  /** estimate amounts of tokens needed for tx */
  let baseAmount: string;
  let quoteAmount: string;
  if (params.isAmountBase) {
    baseAmount = params.amount;
    quoteAmount = getConcQuoteTokensFromBaseTokens(
      params.amount,
      params.pool.stats.lastPriceSwap.toString(),
      params.minPriceWei,
      params.maxPriceWei
    );
  } else {
    quoteAmount = params.amount;
    baseAmount = getConcBaseTokensFromQuoteTokens(
      params.amount,
      params.pool.stats.lastPriceSwap.toString(),
      params.minPriceWei,
      params.maxPriceWei
    );
  }
  /** Allowance check on tokens from croc Dex */
  // approve more than we actually need to give room for error
  const { data: baseApproval, error: baseApprovalError } = percentOfAmount(
    baseAmount,
    110
  );
  if (baseApprovalError) {
    return NEW_ERROR("addConcLiquidityFlow: " + errMsg(baseApprovalError));
  }
  const { data: quoteApproval, error: quoteApprovalError } = percentOfAmount(
    quoteAmount,
    110
  );
  if (quoteApprovalError) {
    return NEW_ERROR("addConcLiquidityFlow: " + errMsg(quoteApprovalError));
  }
  const { data: allowanceTxs, error: allowanceError } = await createApprovalTxs(
    params.chainId,
    params.ethAccount,
    [
      {
        address: params.pool.base.address,
        symbol: params.pool.base.symbol,
      },
      {
        address: params.pool.quote.address,
        symbol: params.pool.quote.symbol,
      },
    ],
    [baseApproval, quoteApproval],
    { address: params.crocDexAddress, name: "Ambient" }
  );
  if (allowanceError) {
    return NEW_ERROR("addConcLiquidityFlow: " + errMsg(allowanceError));
  }

  // push allowance txs to the list (might be none)
  txList.push(...allowanceTxs);

  /** create add liquidity tx */
  txList.push(
    _addConcLiquidityTx(
      params.chainId,
      params.crocDexAddress,
      params.pool.base.address,
      params.pool.quote.address,
      params.pool.poolIdx,
      params.isAmountBase ? baseAmount : quoteAmount,
      params.isAmountBase,
      params.lowerTick,
      params.upperTick,
      params.minPriceQ64,
      params.maxPriceQ64,
      TX_DESCRIPTIONS.ADD_AMBIENT_CONC_LIQ()
    )
  );

  return NO_ERROR({ transactions: txList });
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _addConcLiquidityTx = (
  chainId: number,
  crocDexAddress: string,
  baseAddress: string,
  quoteAddress: string,
  poolIdx: number,
  amount: string,
  isAmountBase: boolean,
  lowerTick: number,
  upperTick: number,
  minPriceQ64: string,
  maxPriceQ64: string,
  description: TransactionDescription
): Transaction => {
  const calldata = eth.abi.encodeParameters(
    [
      "uint8",
      "address",
      "address",
      "uint256",
      "int24",
      "int24",
      "uint128",
      "uint128",
      "uint128",
      "uint8",
      "address",
    ],
    [
      isAmountBase ? 11 : 12,
      baseAddress,
      quoteAddress,
      poolIdx,
      lowerTick,
      upperTick,
      amount,
      minPriceQ64,
      maxPriceQ64,
      0,
      ZERO_ADDRESS,
    ]
  );
  return {
    description,
    chainId: chainId,
    type: "EVM",
    target: crocDexAddress,
    abi: CROC_SWAP_DEX_ABI,
    method: "userCmd",
    params: [2, calldata],
    value: "0",
  };
};

const _removeConcLiquidityTx = (
  chainId: number,
  crocDexAddress: string,
  baseAddress: string,
  quoteAddress: string,
  poolIdx: number,
  liquidity: string,
  lowerTick: number,
  upperTick: number,
  minPriceQ64: string,
  maxPriceQ64: string,
  description: TransactionDescription
): Transaction => {
  const calldata = eth.abi.encodeParameters(
    [
      "uint8",
      "address",
      "address",
      "uint256",
      "int24",
      "int24",
      "uint128",
      "uint128",
      "uint128",
      "uint8",
      "address",
    ],
    [
      2,
      baseAddress,
      quoteAddress,
      poolIdx,
      lowerTick,
      upperTick,
      roundLiquidityForAmbientTx(liquidity),
      minPriceQ64,
      maxPriceQ64,
      0,
      ZERO_ADDRESS,
    ]
  );
  return {
    description,
    chainId: chainId,
    type: "EVM",
    target: crocDexAddress,
    abi: CROC_SWAP_DEX_ABI,
    method: "userCmd",
    params: [2, calldata],
    value: "0",
  };
};

const _ambientClaimRewardsTx = (
  chainId: number,
  rewardsLedgerAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: rewardsLedgerAddress,
  abi: AMBIENT_REWARD_LEDGER_ABI,
  method: "claimRewards",
  params: [],
  value: "0",
});
