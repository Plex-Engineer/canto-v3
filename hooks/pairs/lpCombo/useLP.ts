import { useState } from "react";
import { areEqualAddresses } from "@/utils/address.utils";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { CantoDexHookReturn } from "../cantoDex/interfaces/hookParams";
import useCantoDex from "../cantoDex/useCantoDex";
import { LPPairType } from "./interfaces.ts/pairTypes";
import useAmbientPools from "../newAmbient/useAmbientPools";
import { AmbientHookReturn } from "../newAmbient/interfaces/hookParams";

interface UseLPProps {
  chainId: number;
  userEthAddress?: string;
}
interface UseLPReturn {
  isLoading: boolean;
  cantoDex: CantoDexHookReturn;
  ambient: AmbientHookReturn;
  selection: {
    pair: LPPairType | null;
    setPair: (pairAddress: string | null) => void;
  };
}
export default function useLP(props: UseLPProps): UseLPReturn {
  // grab data from canto dex and ambient
  const cantoDex = useCantoDex(props);
  const ambient = useAmbientPools(props);

  // create list with all pairs
  const allPairs: LPPairType[] = [...cantoDex.pairs, ...ambient.ambientPools];

  ///
  /// INTERNAL FUNCTIONS
  ///

  // state for the pair so that balances can always update
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  // get the pair from the pair list with balances
  function getPair(address: string): ReturnWithError<LPPairType> {
    const pair = allPairs.find((pair) =>
      areEqualAddresses(pair.address, address)
    );
    return pair ? NO_ERROR(pair) : NEW_ERROR("Pair not found");
  }

  return {
    isLoading: cantoDex.isLoading && ambient.isLoading,
    cantoDex,
    ambient,
    selection: {
      pair: getPair(selectedPairId ?? "").data,
      setPair: setSelectedPairId,
    },
  };
}
