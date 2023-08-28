export enum BridgingMethod {
  GRAVITY_BRIDGE = "0",
  IBC = "1",
  LAYER_ZERO = "2",
}

/**
 * @notice Converts a BridgingMethod enum to a string representation of a bridging method to
 * @param {BridgingMethod} method for bridging
 * @returns string representation of bridging method
 */
export function bridgeMethodToString(method: BridgingMethod): string {
  switch (method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return "Gravity Bridge";
    case BridgingMethod.IBC:
      return "IBC";
    case BridgingMethod.LAYER_ZERO:
      return "Layer Zero";
    default:
      return "Unknown";
  }
}
/**
 * @notice Converts a BridgingMethod enum to a string representation of a bridging method icon
 * @param {BridgingMethod} method for bridging
 * @returns string representation of bridging method icon
 */
export function bridgeMethodToIcon(method: BridgingMethod): string {
  switch (method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.svg";
    case BridgingMethod.IBC:
      return "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg";
    case BridgingMethod.LAYER_ZERO:
      return "/networks/layer_zero.png";
    default:
      return "";
  }
}
