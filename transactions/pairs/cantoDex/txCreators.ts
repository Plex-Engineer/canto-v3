import { DEX_REOUTER_ABI } from "@/config/abis";
import { Transaction, TransactionDescription } from "@/transactions/interfaces";

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _addCantoDexLiquidityTx = (
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
  deadline: string,
  description: TransactionDescription
): Transaction => {
  const cantoInPair = isToken1Canto || isToken2Canto;
  return {
    description,
    fromAddress: ethAccount,
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
export const _removeCantoDexLiquidityTx = (
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
  deadline: string,
  description: TransactionDescription
): Transaction => {
  const cantoInPair = isToken1Canto || isToken2Canto;
  return {
    description,
    fromAddress: ethAccount,
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
