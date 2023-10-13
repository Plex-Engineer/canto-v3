import { BridgingMethod } from "../interfaces/bridgeMethods";
import { NEW_ERROR, PromiseWithError, BridgeStatus } from "@/config/interfaces";
import { checkGbridgeTxStatus } from "./methods/gravityBridge";
import { checkLZBridgeStatus } from "./methods/layerZero";

export async function getBridgeStatus(
  type: BridgingMethod,
  chainId: number,
  txHash: string
): PromiseWithError<BridgeStatus> {
  switch (type) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return checkGbridgeTxStatus(chainId, txHash);
    case BridgingMethod.LAYER_ZERO:
      return checkLZBridgeStatus(chainId, txHash);
    default:
      return NEW_ERROR("getBridgeStatus::Unknown bridging method");
  }
}
