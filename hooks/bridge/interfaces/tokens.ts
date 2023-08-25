import { ERC20Token, IBCToken } from "@/config/interfaces/tokens";
import { BridgingMethod } from "./bridgeMethods";

export type BridgeToken = BridgeInToken | BridgeOutToken;

// BridgeIn and BridgeOut are the same thing, but with different bridging methods object
export type BridgeInToken = {
  bridgeMethods: BridgingMethod[];
} & (ERC20Token | IBCToken);

export type BridgeOutToken = {
  bridgeMethods: {
    chainId: string;
    methods: BridgingMethod[];
  }[];
} & (ERC20Token | IBCToken);

// for user balance data on bridge
export interface UserTokenBalances {
  [key: string]: string; // token id => balance
}
