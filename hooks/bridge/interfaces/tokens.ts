import { ERC20Token, IBCToken, OFTToken } from "@/config/interfaces";
import { BridgingMethod } from "./bridgeMethods";

export type BridgeToken = BridgeInToken | BridgeOutToken;

// BridgeIn and BridgeOut are the same thing, but with different bridging methods object
export type BridgeInToken = {
  bridgeMethods: BridgingMethod[];
} & (ERC20Token | IBCToken | OFTToken);

export type BridgeOutToken = {
  bridgeMethods: {
    chainId: string;
    methods: BridgingMethod[];
  }[];
} & (ERC20Token | IBCToken | OFTToken);
