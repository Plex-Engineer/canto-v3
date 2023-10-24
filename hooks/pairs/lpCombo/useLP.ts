import { useState } from "react";
import { areEqualAddresses } from "@/utils/address.utils";
import {
  NEW_ERROR,
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { CantoDexHookReturn } from "../cantoDex/interfaces/hookParams";
import useCantoDex from "../cantoDex/useCantoDex";
import { LPPairType } from "./interfaces.ts/pairTypes";
import useAmbientPools from "../newAmbient/useAmbientPools";
import { AmbientHookReturn } from "../newAmbient/interfaces/hookParams";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { ClaimDexRewardsParams } from "./transactions/claimRewards";

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
  claimRewards: () => ReturnWithError<NewTransactionFlow>;
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

  // claim rewards flow
  function claimComboRewardsFlow(): ReturnWithError<NewTransactionFlow> {
    const params: ClaimDexRewardsParams = {};
    const clmRewards = cantoDex.position.totalRewards;
    if (clmRewards !== "0") {
      params.clmParams = {
        chainId: props.chainId,
        ethAccount: props.userEthAddress ?? "",
        estimatedRewards: clmRewards,
      };
    }
    const ambientRewards = ambient.rewards;
    if (ambientRewards !== "0") {
      params.ambientParams = {
        chainId: props.chainId,
        ethAccount: props.userEthAddress ?? "",
        estimatedRewards: ambientRewards,
      };
    }
    if (!params.ambientParams && !params.clmParams) {
      return NEW_ERROR("No rewards to claim");
    }
    return NO_ERROR({
      title: "Claim Rewards",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
      txType: TransactionFlowType.CLAIM_LP_REWARDS_TX,
      params,
    });
  }

  return {
    isLoading: cantoDex.isLoading && ambient.isLoading,
    cantoDex,
    ambient,
    selection: {
      pair: getPair(selectedPairId ?? "").data,
      setPair: setSelectedPairId,
    },
    claimRewards: claimComboRewardsFlow,
  };
}
