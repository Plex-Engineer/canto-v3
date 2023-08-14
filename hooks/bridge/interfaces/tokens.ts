import { ERC20Token } from "@/config/interfaces/tokens";

export enum BridgingMethod {
  GRAVITY_BRIDGE = "0",
  IBC = "1",
  LAYER_ZERO = "2",
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
