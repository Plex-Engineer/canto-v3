"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { Validation } from "@/config/interfaces";
import {
  GeneralAmbientPairRow,
  GeneralCantoDexPairRow,
  UserAmbientPairRow,
  UserCantoDexPairRow,
} from "./components/pairRow";
import Text from "@/components/text";
import { CantoDexLPModal } from "./components/cantoDexLPModal";
import styles from "./lp.module.scss";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import {
  isAmbientPool,
  isCantoDexPair,
} from "@/hooks/pairs/lpCombo/interfaces.ts/pairTypes";
import { AmbientModal } from "./components/ambient/ambientLPModal";
import { displayAmount } from "@/utils/formatting";
import Rewards from "./components/rewards";
import Container from "@/components/container/container";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { addTokenBalances } from "@/utils/math";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { useState } from "react";
import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";

export default function Page() {
  const { txStore, signer, chainId } = useCantoSigner();
  // all pairs (ambient and cantoDex)
  const { cantoDex, ambient, selection, isLoading, claimRewards } = useLP({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });
  //   all pairs filtered by type
  const [filteredPairs, setFilteredPairs] = useState<string>("all");

  /** CANTO DEX */
  const { pairs: cantoDexPairs } = cantoDex;
  const sortedPairs = cantoDexPairs?.sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
  const userCantoDexPairs = cantoDexPairs.filter(
    (pair) =>
      (pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
        pair.clmData?.userDetails?.balanceOfUnderlying !== "0") &&
      pair.clmData?.userDetails?.balanceOfCToken !== undefined
  );

  // transactions
  function sendCantoDexTxFlow(params: Partial<CantoDexTransactionParams>) {
    const flow = cantoDex.transaction.newCantoDexLPFlow({
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
  function canPerformCantoDexTx(
    params: Partial<CantoDexTransactionParams>
  ): Validation {
    return cantoDex.transaction.validateParams({
      chainId: chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
  }

  /** AMBIENT */
  const { ambientPools } = ambient;
  const userAmbientPools = ambientPools.filter(
    (pool) => pool.userPositions.length > 0
  );

  //transactions
  function sendAmbientTxFlow(params: Partial<AmbientTransactionParams>) {
    const { data: flow, error } = ambient.transaction.createNewPoolFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pool: selectedPair,
      ...params,
    } as AmbientTransactionParams);
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({
        txFlow: flow,
        signer: signer,
        onSuccessCallback: () => selection.setPair(null),
      });
    }
  }

  /** general selection */
  const { pair: selectedPair, setPair } = selection;

  function sendClaimRewardsFlow() {
    const { data: flow, error } = claimRewards();
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({
        txFlow: flow,
        signer: signer,
        onSuccessCallback: () => selection.setPair(null),
      });
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>{""}</div>;
  }
  const pairNames = {
    all: "All Pairs",
    stable: "Stable Pairs",
    volatile: "Volatile Pairs",
  };
  //main content
  return (
    <div className={styles.container}>
      <Modal
        padded={false}
        open={selectedPair !== null}
        onClose={() => setPair(null)}
        closeOnOverlayClick={false}
      >
        {selectedPair && isCantoDexPair(selectedPair) && (
          <CantoDexLPModal
            pair={selectedPair}
            validateParams={canPerformCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPool(selectedPair) && (
          <AmbientModal pool={selectedPair} sendTxFlow={sendAmbientTxFlow} />
        )}
      </Modal>

      <Container direction="row" gap={"auto"} width="100%">
        <Text size="x-lg" className={styles.title}>
          Pools
        </Text>

        <Rewards
          onClick={sendClaimRewardsFlow}
          value={displayAmount(
            addTokenBalances(cantoDex.position.totalRewards, ambient.rewards),
            18,
            {
              precision: 4,
            }
          )}
        />
      </Container>
      <Spacer height="30px" />

      {userCantoDexPairs.length + userAmbientPools.length > 0 && (
        <>
          <Table
            title="Your Pairs"
            headers={[
              { value: "Pair", ratio: 2 },
              { value: "APR", ratio: 1 },
              { value: "Pool Share", ratio: 1 },
              { value: "Value", ratio: 1 },
              { value: "Rewards", ratio: 1 },
              { value: "Edit", ratio: 1 },
            ]}
            content={[
              ...userAmbientPools.map((pool) =>
                UserAmbientPairRow({
                  pool,
                  onManage: (poolAddress) => {
                    setPair(poolAddress);
                  },
                  rewards: ambient.rewards,
                })
              ),
              ...userCantoDexPairs.map((pair) =>
                UserCantoDexPairRow({
                  pair,
                  onManage: (pairAddress) => {
                    setPair(pairAddress);
                  },
                })
              ),
            ]}
          />
          <Spacer height="20px" />
        </>
      )}

      <Table
        //@ts-ignore
        title={pairNames[filteredPairs]}
        secondary={
          <Container width="400px">
            <ToggleGroup
              options={["all", "stable", "volatile"]}
              selected={filteredPairs}
              setSelected={(value) => {
                setFilteredPairs(value);
              }}
            />
          </Container>
        }
        headers={[
          { value: "Pair", ratio: 2 },
          { value: "APR", ratio: 1 },
          { value: "TVL", ratio: 1 },
          { value: "Type", ratio: 1 },
          { value: "Action", ratio: 1 },
        ]}
        content={[
          ...ambientPools
            .filter(
              (pool) =>
                filteredPairs === "all" ||
                (filteredPairs === "stable" && pool.stable) ||
                (filteredPairs === "volatile" && !pool.stable)
            )
            .map((pool) =>
              GeneralAmbientPairRow({
                pool,
                onAddLiquidity: (poolAddress) => setPair(poolAddress),
              })
            ),
          ...sortedPairs
            .filter(
              (pair) =>
                filteredPairs === "all" ||
                (filteredPairs === "stable" && pair.stable) ||
                (filteredPairs === "volatile" && !pair.stable)
            )
            .map((pair) =>
              GeneralCantoDexPairRow({
                pair,
                onAddLiquidity: (pairAddress) => setPair(pairAddress),
              })
            ),
        ]}
      />
      <Spacer height="40px" />
    </div>
  );
}
