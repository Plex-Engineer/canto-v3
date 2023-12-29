import { BridgeToken } from "../interfaces/tokens";
import { isOFTToken } from "@/utils/tokens";
import BigNumber from "bignumber.js";
import { BridgingMethod } from "@/transactions/bridge";
import { BridgeFeesByMethod } from "../interfaces/bridgeFees";

/**
 * @notice Returns the maximum amount of tokens that can be bridged
 * @param {BridgeToken} token the token to bridge
 * @param {BridgeFeesByMethod} fees the fees for the bridging method
 * @returns {string} the maximum amount of tokens that can be bridged
 */
export function maxBridgeAmountForToken(
  token: BridgeToken | null,
  fees: BridgeFeesByMethod | null,
  extraFees?: {
    gBridgeFee: string;
  }
): string {
  // make sure params are valid
  if (!(token && token.balance)) return "0";

  // check if LZ bridge and native wrapped token (since gas takes away from balance)
  if (
    fees &&
    fees.method === BridgingMethod.LAYER_ZERO &&
    isOFTToken(token) &&
    token.nativeWrappedToken
  ) {
    const max = new BigNumber(token.balance).minus(fees.lzFee.amount);
    return max.isGreaterThan(0) ? max.integerValue().toString() : "0";
  }

  // check if gravity bridge out for bridging fees
  if (
    fees &&
    fees.method === BridgingMethod.GRAVITY_BRIDGE &&
    fees.direction === "out"
  ) {
    const max = new BigNumber(token.balance)
      .dividedBy(1 + fees.chainFeePercent / 100)
      .minus(extraFees?.gBridgeFee ?? 0);
    return max.isGreaterThan(0) ? max.integerValue().toString() : "0";
  }
  // otherwise return the balance
  return token.balance;
}
