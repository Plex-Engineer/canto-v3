import { AmbientPair } from "../../ambient/interfaces/ambientPairs";
import { CantoDexPairWithUserCTokenData } from "../../cantoDex/interfaces/pairs";

export type LPPairType = AmbientPair | CantoDexPairWithUserCTokenData;

// utilities for deciding pair type for hook functionality
export function isAmbientPair(pair: LPPairType): pair is AmbientPair {
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
