import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { newContractInstance } from "@/utils/evm";
import { DEX_REOUTER_ABI } from "@/config/abis";
import { CantoDexPair } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { convertToBigNumber, formatBalance } from "../formatting";

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
    return NEW_ERROR("quoteRemoveLiquidity", err);
  }
}

interface AddLiquidityValues {
  chainId: number;
  pair: CantoDexPair;
  valueChanged: 1 | 2;
  amount: string;
}
/**
 * @notice Returns the optimal amount of token 2 for a given amount of token 1
 * @param {AddLiquidityValues} params - The parameters to get optimal amount
 * @returns {PromiseWithError<string>} Optimal amount of token 2 formatted to readable amount
 */
export async function getOptimalValueBFormatted({
  chainId,
  pair,
  valueChanged,
  amount,
}: AddLiquidityValues): PromiseWithError<string> {
  const routerAddress = getCantoCoreAddress(chainId, "router");
  if (!routerAddress)
    return NEW_ERROR("getOptimalValueB: Router address not found");

  // switch the setters and values to simplify quote
  let token1;
  let token2;
  if (valueChanged === 1) {
    token1 = pair.token1;
    token2 = pair.token2;
  } else {
    token1 = pair.token2;
    token2 = pair.token1;
  }
  // get big number amount
  const { data: bnAmount, error: bnAmountError } = convertToBigNumber(
    amount,
    token1.decimals
  );
  if (bnAmountError) {
    return NEW_ERROR("getOptimalValueB", bnAmountError);
  }
  // quote add liquidity to get optimal amount for token 2
  const { data: quote, error: quoteError } = await quoteAddLiquidity(
    chainId,
    routerAddress,
    token1.address,
    token2.address,
    pair.stable,
    bnAmount.toString()
  );
  if (quoteError) {
    return NEW_ERROR("getOptimalValueB", quoteError);
  }
  // set value2 to quote
  return NO_ERROR(
    formatBalance(quote.amountBOptimal, token2.decimals, {
      precision: token2.decimals,
    })
  );
}

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
async function quoteAddLiquidity(
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
    return NEW_ERROR("quoteAddLiquidity", err);
  }
}
