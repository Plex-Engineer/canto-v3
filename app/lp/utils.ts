import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import { useState } from "react";

export default function usePool() {
  const { txStore, signer, chainId } = useCantoSigner();
  // all pairs (ambient and cantoDex)
  const { isLoading, pairs, rewards, selection, transactions } = useLP({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });
  /** general selection */
  const { pair: selectedPair, setPair } = selection;

  //   all pairs filtered by type
  const [filteredPairs, setFilteredPairs] = useState<string>("all");

  /** CANTO DEX */
  const sortedCantoDexPairs = pairs.allCantoDex.sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
  function validateCantoDexTx(params: Partial<CantoDexTransactionParams>) {
    return transactions.validateCantoDexLPParams({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
  }
  function sendCantoDexTxFlow(params: Partial<CantoDexTransactionParams>) {
    const flow = transactions.newCantoDexLPFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
    txStore?.addNewFlow({
      txFlow: flow,
      signer: signer,
      onSuccessCallback: () => selection.setPair(null),
    });
  }

  /** AMBIENT */

  function validateAmbientTxParams(params: Partial<AmbientTransactionParams>) {
    return transactions.validateAmbientPoolTxParams({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pool: selectedPair,
      ...params,
    } as AmbientTransactionParams);
  }
  function sendAmbientTxFlow(params: Partial<AmbientTransactionParams>) {
    const flow = transactions.newAmbientPoolTxFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pool: selectedPair,
      ...params,
    } as AmbientTransactionParams);

    txStore?.addNewFlow({
      txFlow: flow,
      signer: signer,
      onSuccessCallback: () => selection.setPair(null),
    });
  }

  /** REWARDS */

  function sendClaimRewardsFlow() {
    const flow = transactions.newClaimRewardsFlow();
    txStore?.addNewFlow({
      txFlow: flow,
      signer: signer,
      onSuccessCallback: () => selection.setPair(null),
    });
  }

  const pairNames = {
    all: "All Pairs",
    stable: "Stable Pairs",
    volatile: "Volatile Pairs",
  };

  return {
    isLoading,
    pairs,
    rewards,
    filteredPairs,
    setFilteredPairs,
    selectedPair,
    setPair,
    sortedCantoDexPairs,
    validateCantoDexTx,
    sendCantoDexTxFlow,
    validateAmbientTxParams,
    sendAmbientTxFlow,
    sendClaimRewardsFlow,
    pairNames,
  };
}
