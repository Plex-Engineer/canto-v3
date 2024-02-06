import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { ETH_MAINNET, GRAVITY_BRIDGE } from "@/config/networks";
import { tryFetch } from "@/utils/async";
import { displayAmount } from "@/utils/formatting";
import BigNumber from "bignumber.js";
import Web3 from "web3";

/**
 *
 * @returns {PromiseWithError<string>} percentage of token bridged that must be paid as a fee
 */
export async function getGravityChainFeeInPercent(): PromiseWithError<number> {
  const { data: gravityParams, error: gravityParamsError } = await tryFetch<{
    params: { min_chain_fee_basis_points: string };
  }>(`${GRAVITY_BRIDGE.restEndpoint}/gravity/v1beta/params`);
  if (gravityParamsError)
    return NEW_ERROR("getGravityChainFeeInPercent", gravityParamsError.message);
  const { min_chain_fee_basis_points } = gravityParams.params;
  return NO_ERROR(Number(min_chain_fee_basis_points) / 100);
}

/**
 * slow: within a day (50k eth gas worth)
 * medium: within 4 hours (400k eth gas worth)
 * fast: instant (750k eth gas worth)
 * @dev will use prices on canto
 */
type FeeTier = {
  fee: string;
  usdValueFormatted: string;
};
export async function getGravityBridgeFeesFromToken(
  tokenAddress: string
): PromiseWithError<{
  slow: FeeTier;
  medium: FeeTier;
  fast: FeeTier;
}> {
  try {
    // get current gas price on ETH mainnet
    const currentGasPrice = (
      await new Web3(ETH_MAINNET.rpcUrl).eth.getGasPrice()
    ).toString();

    // get ETH price in USD
    const { data: ethPriceInUSD, error: ethPriceInUSDError } =
      await getEthPriceInUSDC();
    if (ethPriceInUSDError) throw ethPriceInUSDError;

    // get gravity token data
    const gravityToken = gravityTokens[tokenAddress];
    if (!gravityToken || !(gravityToken.isETH || gravityToken.stable))
      throw new Error("token unavailable");

    // get ratio of token price (tokens/eth)
    const decimalFactor = new BigNumber(10).pow(18 - gravityToken.decimals);
    const tokenToEthRatio = gravityToken.isETH
      ? new BigNumber(1)
      : new BigNumber(ethPriceInUSD).div(decimalFactor);

    const feeTier = (fee: number) => {
      const feeInToken = tokenToEthRatio
        .multipliedBy(currentGasPrice)
        .multipliedBy(fee)
        .integerValue();

      return {
        fee: feeInToken.toString(),
        usdValueFormatted: displayAmount(
          gravityToken.stable
            ? feeInToken.toString()
            : feeInToken.multipliedBy(ethPriceInUSD).toString(),
          gravityToken.decimals,
          {
            precision: 2,
          }
        ),
      };
    };

    // return fee tiers with USD prices
    return NO_ERROR({
      slow: feeTier(50000),
      medium: feeTier(400000),
      fast: feeTier(750000),
    });
  } catch (err) {
    return NEW_ERROR("getGravityBridgeFeesFromToken", err);
  }
}

const gravityTokens: {
  [key: string]: {
    symbol: string;
    stable: boolean;
    decimals: number;
    isETH: boolean;
  };
} = {
  "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd": {
    symbol: "USDC",
    stable: true,
    decimals: 6,
    isETH: false,
  },
  "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75": {
    symbol: "USDT",
    stable: true,
    decimals: 6,
    isETH: false,
  },
  "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687": {
    symbol: "WETH",
    stable: false,
    decimals: 18,
    isETH: true,
  },
  "0xc71aAf8e486e3F33841BB56Ca3FD2aC3fa8D29a8": {
    symbol: "WSTETH",
    stable: false,
    decimals: 18,
    isETH: true,
  },
} as const;

async function getEthPriceInUSDC(): PromiseWithError<string> {
  const { data, error } = await tryFetch<{ usdPriceFormatted: string }>(
    "https://deep-index.moralis.io/api/v2.2/erc20/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/price?chain=eth",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_ETH_PRICE_KEY as string,
      },
    }
  );
  if (error) return NEW_ERROR("getEthPriceInUSDC", error);
  return NO_ERROR(data.usdPriceFormatted);
}
