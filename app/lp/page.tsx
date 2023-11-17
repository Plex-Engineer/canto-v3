"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
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
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { useState } from "react";
import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";

export default function Page() {
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
        open={selectedPair !== null}
        onClose={() => setPair(null)}
        closeOnOverlayClick={false}
      >
        {selectedPair && isCantoDexPair(selectedPair) && (
          <CantoDexLPModal
            pair={selectedPair}
            validateParams={validateCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPool(selectedPair) && (
          <AmbientModal
            pool={selectedPair}
            sendTxFlow={sendAmbientTxFlow}
            verifyParams={validateAmbientTxParams}
          />
        )}
      </Modal>

      <Container direction="row" gap={"auto"} width="100%">
        <Text size="x-lg" className={styles.title}>
          Pools
        </Text>

        <Rewards
          onClick={sendClaimRewardsFlow}
          value={displayAmount(rewards.total, 18, {
            precision: 4,
          })}
        />
      </Container>
      <Spacer height="30px" />

      {pairs.userCantoDex.length + pairs.userAmbient.length > 0 && (
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
              ...pairs.userAmbient.map((pool) =>
                UserAmbientPairRow({
                  pool,
                  onManage: (poolAddress) => {
                    setPair(poolAddress);
                  },
                  rewards: rewards.ambient,
                })
              ),
              ...pairs.userCantoDex.map((pair) =>
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
          ...pairs.allAmbient
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
          ...sortedCantoDexPairs
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
