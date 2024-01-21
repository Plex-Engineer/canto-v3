import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import { useState } from "react";
import { useBlockNumber } from "wagmi";
import { useEffect } from "react";
import { CANTO_MAINNET_EVM } from "@/config/networks";
import { TimeDisplayValues } from "@/hooks/pairs/newAmbient/interfaces/timeDisplay";
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

  let prevBlockNumber = BigInt(7844908); //need to update after provided
  const blocksInEpoch = BigInt(104272);
  const blockDuration = 5.8;
  let remBlocksInEpoch = BigInt(104272);
  const { data: blockNumber } = useBlockNumber({
    chainId: CANTO_MAINNET_EVM.chainId,
    watch: true,
  });

  const UserAmbientRewardsTimer = (blockNumber: bigint | undefined) => {
    let remTime = 0n;
    if (blockNumber) {
      const noOfWeeksToBeAdded =
        (blockNumber - prevBlockNumber) / blocksInEpoch;
      prevBlockNumber = prevBlockNumber + noOfWeeksToBeAdded * blocksInEpoch;
      remBlocksInEpoch = prevBlockNumber + blocksInEpoch - blockNumber;
      remTime = remBlocksInEpoch * BigInt(blockDuration * 1000);
    }
    return remTime;
  };
  const getTimerObj = (remTime: bigint): string => {
    const stateObj: TimeDisplayValues = {
      days: Number(remTime / BigInt(1000 * 60 * 60 * 24)),
      hours: Number(
        (remTime % BigInt(1000 * 60 * 60 * 24)) / BigInt(1000 * 60 * 60)
      ),
      minutes: Number((remTime % BigInt(1000 * 60 * 60)) / BigInt(1000 * 60)),
      seconds: Number((remTime % BigInt(1000 * 60)) / BigInt(1000)),
    };
    return `${stateObj.days} : ${stateObj.hours} : ${stateObj.minutes} : ${stateObj.seconds}`;
  };
  const [ambientRewardsTimer, setAmbientRewardsTimer] = useState(
    getTimerObj(0n)
  );
  useEffect(() => {
    let remTime = remBlocksInEpoch * BigInt(blockDuration * 1000);
    if (!blockNumber) {
      setAmbientRewardsTimer("Loading...");
      return;
    }
    remTime = UserAmbientRewardsTimer(blockNumber);
    setInterval(() => {
      if (remTime === 0n) {
        remTime = UserAmbientRewardsTimer(blockNumber);
      }
      remTime = remTime - 1000n;
      setAmbientRewardsTimer(getTimerObj(remTime));
    }, 1000);
  }, [blockNumber != undefined]);

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
    ambientRewardsTimer,
  };
}
