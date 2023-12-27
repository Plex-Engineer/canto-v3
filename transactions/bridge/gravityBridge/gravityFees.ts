import { getCantoCoreAddress } from "@/config/consts/addresses";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import {
  CANTO_MAINNET_EVM,
  ETH_MAINNET,
  GRAVITY_BRIDGE,
} from "@/config/networks";
import { areEqualAddresses } from "@/utils/address";
import { tryFetch } from "@/utils/async";
import { getSwapAmountFromAmount } from "@/utils/tokens";
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
export async function getGravityBridgeFeesFromToken(
  tokenAddress: string
): PromiseWithError<{
  slow: string;
  medium: string;
  fast: string;
}> {
  try {
    // get current gas price on ETH mainnet
    const currentGasPrice = (
      await new Web3(ETH_MAINNET.rpcUrl).eth.getGasPrice()
    ).toString();

    // get weth address
    const wethAddress = getCantoCoreAddress(CANTO_MAINNET_EVM.chainId, "weth");
    if (!wethAddress) throw new Error("no weth address");

    // get ratio of token price (tokens/eth)
    let tokenToEthRatio: BigNumber;
    if (areEqualAddresses(tokenAddress, wethAddress)) {
      tokenToEthRatio = new BigNumber(1);
    } else {
      // get amount of tokens from swapping 1 ETH for token
      const { data: swapPrice, error: swapPriceError } =
        await getSwapAmountFromAmount(
          "1000000000000000000",
          wethAddress,
          tokenAddress
        );
      if (swapPriceError) throw swapPriceError;
      tokenToEthRatio = new BigNumber(swapPrice).div(1e18);
    }

    const feeTier = (fee: number) =>
      tokenToEthRatio
        .multipliedBy(currentGasPrice)
        .multipliedBy(fee)
        .integerValue()
        .toString();

    // get estimates for fees by speed
    return NO_ERROR({
      slow: feeTier(50000),
      medium: feeTier(400000),
      fast: feeTier(750000),
    });
  } catch (err) {
    return NEW_ERROR("getGravityBridgeFeesFromToken", err);
  }
}
