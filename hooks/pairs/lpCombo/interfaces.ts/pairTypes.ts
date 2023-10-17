import { CantoDexPairWithUserCTokenData } from "../../cantoDex/interfaces/pairs";
import { AmbientPool } from "../../newAmbient/interfaces/ambientPools";

export type LPPairType = AmbientPool | CantoDexPairWithUserCTokenData;

// utilities for deciding pair type for hook functionality
export function isAmbientPool(pair: LPPairType): pair is AmbientPool {
  return (
    typeof pair === "object" &&
    "base" in pair &&
    "quote" in pair &&
    "poolIdx" in pair
  );
}
export function isCantoDexPair(
  pair: LPPairType
): pair is CantoDexPairWithUserCTokenData {
  return typeof pair === "object" && "token1" in pair && "token2" in pair;
}
