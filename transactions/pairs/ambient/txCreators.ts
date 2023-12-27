import { eth } from "web3";
import {
  CantoFETxType,
  Transaction,
  TransactionDescription,
} from "@/transactions/interfaces";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { AMBIENT_REWARD_LEDGER_ABI, CROC_SWAP_DEX_ABI } from "@/config/abis";
import { roundLiquidityForAmbientTx } from "@/utils/ambient";

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _addAmbientConcLiquidityTx = (
  chainId: number,
  fromEthAddress: string,
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
    feTxType: CantoFETxType.ADD_CONC_LIQUIDITY_AMBIENT,
    chainId: chainId,
    fromAddress: fromEthAddress,
    type: "EVM",
    target: crocDexAddress,
    abi: CROC_SWAP_DEX_ABI,
    method: "userCmd",
    params: [2, calldata],
    value: "0",
  };
};

export const _removeAmbientConcLiquidityTx = (
  chainId: number,
  fromEthAddress: string,
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
    feTxType: CantoFETxType.REMOVE_CONC_LIQUIDITY_AMBIENT,
    chainId: chainId,
    fromAddress: fromEthAddress,
    type: "EVM",
    target: crocDexAddress,
    abi: CROC_SWAP_DEX_ABI,
    method: "userCmd",
    params: [2, calldata],
    value: "0",
  };
};

export const _ambientClaimRewardsTx = (
  chainId: number,
  fromEthAddress: string,
  rewardsLedgerAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.CLAIM_REWARDS_AMBIENT,
  chainId: chainId,
  fromAddress: fromEthAddress,
  type: "EVM",
  target: rewardsLedgerAddress,
  abi: AMBIENT_REWARD_LEDGER_ABI,
  method: "claimRewards",
  params: [],
  value: "0",
});
