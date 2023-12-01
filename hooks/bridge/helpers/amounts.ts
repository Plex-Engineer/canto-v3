import { BridgeToken } from "../interfaces/tokens";
import { isOFTToken } from "@/utils/tokens";
import BigNumber from "bignumber.js";
import { BridgingMethod } from "@/transactions/bridge";

/**
 * Returns the maximum amount of tokens that can be bridged
 * @param {string} direction the direction of the bridge
 * @param {BridgeToken} token the token to bridge
 * @param {BridgingMethod} method the bridging method
 * @param {object} fees the fees for the bridging method
 * @returns {string} the maximum amount of tokens that can be bridged
 */
export function maxBridgeAmountForToken(
  direction: "in" | "out",
  token: BridgeToken | null,
  method: BridgingMethod | null,
  fees?: {
    lzFee?: string;
    gravityBridgeFee?: string;
    gravityChainFeePercent?: number;
  }
): string {
  // make sure token, balance, and method are defined
  if (!token || !token.balance || !method) return "0";

  // check if LZ bridge and native wrapped token (since gas takes away from balance)
  if (
    method === BridgingMethod.LAYER_ZERO &&
    isOFTToken(token) &&
    token.nativeWrappedToken
  ) {
    const bnBalance = new BigNumber(token.balance);
    const max = bnBalance.minus(fees?.lzFee ?? "0");
    return max.isGreaterThan(0) ? max.toString() : "0";
  }
  // check if gravity bridge and out (for bridging fees)
  else if (method === BridgingMethod.GRAVITY_BRIDGE && direction === "out") {
    if (!fees?.gravityChainFeePercent) return "0";
    const max = new BigNumber(token.balance)
      .dividedBy(1 + fees.gravityChainFeePercent)
      .minus(fees.gravityBridgeFee ?? 0);
    return max.isGreaterThan(0) ? max.integerValue().toString() : "0";
  }
  // otherwise return the balance
  else {
    return token.balance;
  }
}
