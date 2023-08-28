export enum BridgingMethod {
  GRAVITY_BRIDGE = "0",
  IBC = "1",
  LAYER_ZERO = "2",
}

type BridgeMethodInfo = {
  [key in BridgingMethod]: {
    name: string;
    icon: string;
    id: string;
  };
};

const BRIDGE_METHOD_INFO: BridgeMethodInfo = {
  [BridgingMethod.GRAVITY_BRIDGE]: {
    name: "Gravity Bridge",
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg",
    id: "bridge-gravity",
  },
  [BridgingMethod.IBC]: {
    name: "IBC",
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
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
