import { useState } from "react";
import { areEqualAddresses } from "@/utils/address";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import useCantoDex from "../cantoDex/useCantoDex";
import { LPPairType } from "./interfaces.ts/pairTypes";
import useAmbientPools from "../newAmbient/useAmbientPools";
import { CantoDexPairWithUserCTokenData } from "../cantoDex/interfaces/pairs";
import { AmbientPool } from "../newAmbient/interfaces/ambientPools";
import { NewTransactionFlow, TransactionFlowType } from "@/transactions/flows";
import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";
import { addTokenBalances } from "@/utils/math";

interface UseLPProps {
  chainId: number;
  userEthAddress?: string;
}

interface UseLPReturn {
  isLoading: boolean;
  pairs: {
    allCantoDex: CantoDexPairWithUserCTokenData[];
    userCantoDex: CantoDexPairWithUserCTokenData[];
    allAmbient: AmbientPool[];
    userAmbient: AmbientPool[];
  };
  rewards: {
    cantoDex: string;
    ambient: string;
    total: string;
  };
  selection: {
    pair: LPPairType | null;
    setPair: (pairAddress: string | null) => void;
  };
  transactions: {
    newCantoDexLPFlow: (
      txParams: CantoDexTransactionParams
    ) => NewTransactionFlow;
    validateCantoDexLPParams: (
      txParams: CantoDexTransactionParams
    ) => Validation;
    newAmbientPoolTxFlow: (
      txParams: AmbientTransactionParams
    ) => NewTransactionFlow;
    validateAmbientPoolTxParams: (
      txParams: AmbientTransactionParams
    ) => Validation;
    newClaimRewardsFlow: () => NewTransactionFlow;
  };
}

// combination of canto dex and ambient pools
export default function useLP(props: UseLPProps): UseLPReturn {
  // grab data from canto dex and ambient
  const cantoDex = useCantoDex(props);
  const ambient = useAmbientPools(props);

  // get user pairs
  const userCantoDexPairs = cantoDex.pairs.filter(
    (pair) =>
      (pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
        pair.clmData?.userDetails?.balanceOfUnderlying !== "0") &&
      pair.clmData?.userDetails?.balanceOfCToken !== undefined
  );
  const userAmbientPairs = ambient.ambientPools.filter(
    (pool) => pool.userPositions.length > 0
  );

  // create list with all pairs
  const allPairs: LPPairType[] = [...cantoDex.pairs, ...ambient.ambientPools];

  ///
  /// SELECTED PAIR STATE
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

  ///
  /// TRANSACTIONS
  ///

  // claim rewards flow
  function newClaimComboRewardsFlow(): NewTransactionFlow {
    const userParams = {
      chainId: props.chainId,
      ethAccount: props.userEthAddress ?? "",
    };
    return {
      title: "Claim Rewards",
      icon: "/icons/canto.svg",
      txType: TransactionFlowType.LP_COMBO_CLAIM_REWARDS_TX,
      params: {
        clmParams: {
          ...userParams,
          estimatedRewards: cantoDex.position.totalRewards,
        },
        ambientParams: { ...userParams, estimatedRewards: ambient.rewards },
      },
    };
  }

  return {
    isLoading: cantoDex.isLoading && ambient.isLoading,
    pairs: {
      allCantoDex: cantoDex.pairs,
      userCantoDex: userCantoDexPairs,
      allAmbient: ambient.ambientPools,
      userAmbient: userAmbientPairs,
    },
    rewards: {
      cantoDex: cantoDex.position.totalRewards,
      ambient: ambient.rewards,
      total: addTokenBalances(cantoDex.position.totalRewards, ambient.rewards),
    },
    selection: {
      pair: getPair(selectedPairId ?? "").data,
      setPair: (pairAddress: string | null) => setSelectedPairId(pairAddress),
    },
    transactions: {
      newAmbientPoolTxFlow: ambient.transaction.newAmbientPoolTxFlow,
      validateAmbientPoolTxParams: ambient.transaction.validateParams,
      newCantoDexLPFlow: cantoDex.transaction.newCantoDexLPFlow,
      validateCantoDexLPParams: cantoDex.transaction.validateParams,
      newClaimRewardsFlow: newClaimComboRewardsFlow,
    },
  };
}
