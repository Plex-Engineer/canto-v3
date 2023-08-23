import { ERC20Token } from "@/config/interfaces/tokens";

export enum BridgingMethod {
  GRAVITY_BRIDGE = "0",
  IBC = "1",
  LAYER_ZERO = "2",
}

/**
 *
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

export type BridgeToken = (BridgeInToken | BridgeOutToken) &
  (ERC20Token | IBCToken);

// BridgeIn and BridgeOut are the same thing, but with different bridging methods object
interface BridgeInToken {
  bridgeMethods: BridgingMethod[];
}
interface BridgeOutToken {
  bridgeMethods: {
    chainId: string;
    methods: BridgingMethod[];
  }[];
}

// extends ERC20 since all IBC tokens supported on Canto will have
// an ERC20 representation
export interface IBCToken extends ERC20Token {
  ibcDenom: string; // "ibc/..."
  nativeName: string; // ex. uatom, ucre, acanto
}

// for user balance data on bridge
export interface UserTokenBalances {
  [key: string]: string; // token id => balance
}
