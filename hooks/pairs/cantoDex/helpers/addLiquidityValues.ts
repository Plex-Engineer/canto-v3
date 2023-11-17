import { getCantoCoreAddress } from "@/config/consts/addresses";
import { CantoDexPair } from "../interfaces/pairs";
import { quoteAddLiquidity } from "@/utils/cantoDex";
import { convertToBigNumber, formatBalance } from "@/utils/formatting";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";

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
    return NEW_ERROR("getOptimalValueB::" + errMsg(bnAmountError));
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
    return NEW_ERROR("getOptimalValueB::" + errMsg(quoteError));
  }
  // set value2 to quote
  return NO_ERROR(
    formatBalance(quote.amountBOptimal, token2.decimals, {
      precision: token2.decimals,
    })
  );
}
