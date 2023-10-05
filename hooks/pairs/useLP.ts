import { useState } from "react";
import useAmbientPairs from "./ambient/useAmbientPairs";
import useCantoDex from "./cantoDex/useCantoDex";
import { areEqualAddresses } from "@/utils/address.utils";
import { NEW_ERROR, NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { CantoDexPairWithUserCTokenData } from "./cantoDex/interfaces/pairs";

interface UseLPProps {
  chainId: number;
  userEthAddress?: string;
}
export default function useLP(props: UseLPProps) {
  // grab data from canto dex and ambient
  const cantoDex = useCantoDex(props);
  const ambient = useAmbientPairs(props);

  ///
  /// INTERNAL FUNCTIONS
  ///

  //TODO: Allow for parent to know which type of token is selected to get th correct functions to use

  // state for the pair so that balances can always update
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  // get the pair from the pair list with balances
  function getPair(
    address: string
  ): ReturnWithError<CantoDexPairWithUserCTokenData> {
    const pair = cantoDex.pairs?.find((pair) =>
      areEqualAddresses(pair.address, address)
    );
    return pair ? NO_ERROR(pair) : NEW_ERROR("Pair not found");
  }

  return {
    cantoDex,
    ambient,
    selection: {
      pair: getPair(selectedPairId ?? "").data,
      setPair: setSelectedPairId,
    },
  };
}
