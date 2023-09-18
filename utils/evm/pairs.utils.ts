import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "./helpers.utils";
import { Contract } from "web3";
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
    // get rpc url from chainId
    const { data: rpcUrl, error } = getRpcUrlFromChainId(chainId);
    if (error) throw error;
    // get router contract
    const routerContract = new Contract(
      DEX_REOUTER_ABI,
      routerAddress,
      getProviderWithoutSigner(rpcUrl)
    );
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
