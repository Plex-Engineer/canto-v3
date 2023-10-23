import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { newContractInstance } from "./helpers.utils";
import { DEX_REOUTER_ABI } from "@/config/abis";

/**
 * @notice gets quote for adding liquidity to a pair
 * @param {number} chainId chainId to get quote for
 * @param {string} routerAddress address of router contract
 * @param {string} tokenAAddress address of token A
 * @param {string} tokenBAddress address of token B
 * @param {boolean} stable whether or not the pair is stable
 * @param {string} amountA amount of token A to add
 * @returns {PromiseWithError<{
 * amountBOptimal: string;
 * expectedLiquidity: string;
 * }>} quote for adding liquidity to a pair
 */
export async function quoteAddLiquidity(
  chainId: number,
  routerAddress: string,
  tokenAAddress: string,
  tokenBAddress: string,
  stable: boolean,
  amountA: string
): PromiseWithError<{
  amountBOptimal: string;
  expectedLiquidity: string;
}> {
  try {
    // get contract instance
    const { data: routerContract, error } = newContractInstance<
      typeof DEX_REOUTER_ABI
    >(chainId, routerAddress, DEX_REOUTER_ABI);
    if (error) throw error;

    // query quoteAddLiquidity with amount B as infinite
    const response = await routerContract.methods
      .quoteAddLiquidity(
        tokenAAddress,
        tokenBAddress,
        stable,
        amountA,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
      .call();
    return NO_ERROR({
      amountBOptimal: (response.amountB as number).toString(),
      expectedLiquidity: (response.liquidity as number).toString(),
    });
  } catch (err) {
    return NEW_ERROR("quoteAddLiquidity::" + errMsg(err));
  }
}

export async function quoteRemoveLiquidity(
  chainId: number,
  routerAddress: string,
  tokenAAddress: string,
  tokenBAddress: string,
  stable: boolean,
  liquidity: string
): PromiseWithError<{
  expectedToken1: string;
  expectedToken2: string;
}> {
  try {
    // get contract instance
    const { data: routerContract, error } = newContractInstance<
      typeof DEX_REOUTER_ABI
    >(chainId, routerAddress, DEX_REOUTER_ABI);
    if (error) throw error;
    // query quoteRemoveLiquidity
    const reponse = await routerContract.methods
      .quoteRemoveLiquidity(tokenAAddress, tokenBAddress, stable, liquidity)
      .call();
    return NO_ERROR({
      expectedToken1: (reponse.amountA as number).toString(),
      expectedToken2: (reponse.amountB as number).toString(),
    });
  } catch (err) {
    return NEW_ERROR("quoteRemoveLiquidity::" + errMsg(err));
  }
}
