import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import { useState, useEffect } from "react";
import { useBlockNumber } from "wagmi";
import { fetchBlockNumber } from "@wagmi/core";
import { CANTO_MAINNET_EVM } from "@/config/networks";

export default function usePool() {
  const { txStore, signer, chainId } = useCantoSigner();
  const connectedEthAccount = signer?.account.address ?? "";
  // all pairs (ambient and cantoDex)
  const { isLoading, pairs, rewards, selection, transactions } = useLP({
    chainId,
    userEthAddress: connectedEthAccount,
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
      ethAccount: connectedEthAccount,
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
  }
  function sendCantoDexTxFlow(params: Partial<CantoDexTransactionParams>) {
    const flow = transactions.newCantoDexLPFlow({
      chainId,
      ethAccount: connectedEthAccount,
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
    txStore?.addNewFlow({
      txFlow: flow,
      ethAccount: connectedEthAccount,
      onSuccessCallback: () => selection.setPair(null),
    });
  }

  /** AMBIENT */

  function validateAmbientTxParams(params: Partial<AmbientTransactionParams>) {
    return transactions.validateAmbientPoolTxParams({
      chainId,
      ethAccount: connectedEthAccount,
      pool: selectedPair,
      ...params,
    } as AmbientTransactionParams);
  }
  function sendAmbientTxFlow(params: Partial<AmbientTransactionParams>) {
    const flow = transactions.newAmbientPoolTxFlow({
      chainId,
      ethAccount: connectedEthAccount,
      pool: selectedPair,
      ...params,
    } as AmbientTransactionParams);

    txStore?.addNewFlow({
      txFlow: flow,
      ethAccount: connectedEthAccount,
      onSuccessCallback: () => selection.setPair(null),
    });
  }

  /** AMBIENT REWARDS TIMER */
  const [rewardTime, setRewardTime] = useState(0n);
  const getRewardsTime = async (): Promise<bigint> => {
    const blockNumber = await fetchBlockNumber({
      chainId: CANTO_MAINNET_EVM.chainId,
    });
    const blocksInEpoch = BigInt(104272);
    const blockDuration = 5.8;
    let prevBlockNumber = BigInt(7841750);
    let remBlocksInEpoch = BigInt(104272);
    let remTime = 0n;
    if (blockNumber) {
      const noOfWeeksToBeAdded =
        (blockNumber - prevBlockNumber) / blocksInEpoch;
      prevBlockNumber = prevBlockNumber + noOfWeeksToBeAdded * blocksInEpoch;
      remBlocksInEpoch = prevBlockNumber + blocksInEpoch - blockNumber;
      remTime = remBlocksInEpoch * BigInt(blockDuration * 1000);
    }
    return BigInt(Date.now()) + remTime;
  };
  useEffect(() => {
    async function setRewards() {
      setRewardTime(await getRewardsTime());
    }
    setRewards();
  }, []);

  /** REWARDS */

  function sendClaimRewardsFlow() {
    const flow = transactions.newClaimRewardsFlow();
    txStore?.addNewFlow({
      txFlow: flow,
      ethAccount: connectedEthAccount,
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
    rewardTime,
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
