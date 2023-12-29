import { BridgeToken } from "@/hooks/bridge/interfaces/tokens";

export type BridgeTransactionParams = {
  method: BridgingMethod | null;
  from: { chainId: string | number; account: string };
  to: { chainId: string | number; account: string };
  token: { data: BridgeToken; amount: string };
  gravityBridgeFees?: {
    bridgeFee: string;
    chainFee: string;
  };
};

export enum BridgingMethod {
  GRAVITY_BRIDGE = "0",
  IBC = "1",
  LAYER_ZERO = "2",
}
export type BridgingMethodName =
  | "Layer Zero"
  | "Gravity Bridge"
  | "IBC"
  | "Unknown";

type BridgeMethodInfo = {
  [key in BridgingMethod]: {
    name: BridgingMethodName;
    icon: string;
    id: string;
  };
};

const BRIDGE_METHOD_INFO: BridgeMethodInfo = {
  [BridgingMethod.GRAVITY_BRIDGE]: {
    name: "Gravity Bridge",
    icon: "/icons/grav.svg",
    id: "bridge-gravity",
  },
  [BridgingMethod.IBC]: {
    name: "IBC",
    icon: "/icons/atom.svg",
    id: "bridge-ibc",
  },
  [BridgingMethod.LAYER_ZERO]: {
    name: "Layer Zero",
    icon: "/networks/layer_zero.png",
    id: "bridge-layer-zero",
  },
} as const;

/**
 * @notice Converts a BridgingMethod enum to a BridgeMethodInfo object
 * @dev This is used to get the name, icon, and id for a bridging method
 * @param {BridgingMethod} method for bridging
 * @returns BridgeMethodInfo object
 */
export function getBridgeMethodInfo(
  method: BridgingMethod | null
): BridgeMethodInfo[BridgingMethod] {
  if (method === null) {
    return {
      name: "Unknown",
      icon: "",
      id: "",
    };
  }
  return BRIDGE_METHOD_INFO[method];
}
