"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { ValidationReturn } from "@/config/interfaces";
import {
  GeneralAmbientPairRow,
  GeneralCantoDexPairRow,
  UserAmbientPairRow,
  UserCantoDexPairRow,
} from "./components/pairRow";
import Text from "@/components/text";
import { CantoDexLPModal } from "./components/cantoDexLPModal";
import styles from "./lp.module.scss";
import { CantoDexTransactionParams } from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import {
  isAmbientPair,
  isCantoDexPair,
} from "@/hooks/pairs/lpCombo/interfaces.ts/pairTypes";
import { AmbientModal } from "./components/ambientLPModal";
import { AmbientTransactionParams } from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";
import { displayAmount } from "@/utils/tokenBalances.utils";
import Rewards from "./components/rewards";
import Container from "@/components/container/container";
import { useEffect, useState } from "react";

export default function Page() {
  const { data: signer } = useWalletClient();
  const [isLoading, setIsLoading] = useState(true);
  const chainId = signer?.chain.id === 7701 ? 7701 : 7700;

  const txStore = useStore(useTransactionStore, (state) => state);

  // all pairs (ambient and cantoDex)
  const { cantoDex, ambient, selection } = useLP({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });

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
    const { data: flow, error } = cantoDex.transaction.createNewPairsFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
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
  function canPerformCantoDexTx(
    params: Partial<CantoDexTransactionParams>
  ): ValidationReturn {
    return cantoDex.transaction.validateParams({
      chainId: chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as CantoDexTransactionParams);
  }
  function sendClaimRewardsFlow() {
    const { data: flow, error } = cantoDex.transaction.createClaimRewardsFlow();
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

  /** AMBIENT */
  const { ambientPairs } = ambient;
  const userAmbientPairs = ambientPairs.filter(
    (pair) => Number(pair.userDetails?.defaultRangePosition.liquidity) !== 0
  );

  //transactions
  function sendAmbientTxFlow(params: Partial<AmbientTransactionParams>) {
    const { data: flow, error } = ambient.transaction.createNewPairsFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
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
  function canPerformAmbientTx(
    params: Partial<AmbientTransactionParams>
  ): ValidationReturn {
    return ambient.transaction.validateParams({
      chainId: chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as AmbientTransactionParams);
  }

  /** general selection */
  const { pair: selectedPair, setPair } = selection;

  useEffect(() => {
    // balances are loaded
    if (
      cantoDex.position.totalRewards !== undefined &&
      sortedPairs.length !== 0 &&
      sortedPairs[0].clmData?.userDetails?.balanceOfCToken !== undefined &&
      sortedPairs[0].clmData?.userDetails?.balanceOfUnderlying !== undefined &&
      sortedPairs[0].clmData?.userDetails?.supplyBalanceInUnderlying !==
        undefined &&
      isLoading == true
    ) {
      setIsLoading(false);
    }
  }, [sortedPairs, cantoDex.position.totalRewards, isLoading]);

  if (isLoading) {
    return <div className={styles.loading}>{""}</div>;
  }

  //main content
  return (
    <div className={styles.container}>
      <Modal open={selectedPair !== null} onClose={() => setPair(null)}>
        {selectedPair && isCantoDexPair(selectedPair) && (
          <CantoDexLPModal
            pair={selectedPair}
            validateParams={canPerformCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPair(selectedPair) && (
          <AmbientModal
            pair={selectedPair}
            validateParams={canPerformAmbientTx}
            sendTxFlow={sendAmbientTxFlow}
          />
        )}
      </Modal>

      <Container direction="row" gap={"auto"} width="100%">
        <Text size="x-lg" className={styles.title}>
          LP
        </Text>
        <Spacer height="30px" />

        <Rewards
          onClick={sendClaimRewardsFlow}
          value={displayAmount(cantoDex.position.totalRewards, 18, {
            precision: 4,
          })}
        />
      </Container>
      <Spacer height="30px" />
      {userCantoDexPairs.length + userAmbientPairs.length > 0 && (
        <Table
          title="Your Pairs"
          headers={[
            "Pair",
            "APR",
            "Pool Share",
            "Value",
            // "# LP Tokens",
            // "# Staked",
            "Rewards",
            "Edit",
          ]}
          columns={7}
          processedData={[
            ...userCantoDexPairs.map((pair) => (
              <UserCantoDexPairRow
                key={pair.symbol}
                pair={pair}
                onManage={(pairAddress) => {
                  setPair(pairAddress);
                }}
              />
            )),
            ...userAmbientPairs.map((pair) => (
              <UserAmbientPairRow
                key={pair.symbol}
                pair={pair}
                onManage={(pairAddress) => {
                  setPair(pairAddress);
                }}
              />
            )),
          ]}
        />
      )}
      <Spacer height="40px" />
      <Table
        title="All Pairs"
        headers={["Pair", "APR", "TVL", "Type", "action"]}
        columns={6}
        processedData={[
          ...sortedPairs.map((pair) => (
            <GeneralCantoDexPairRow
              key={pair.symbol}
              pair={pair}
              onAddLiquidity={(pairAddress) => {
                setPair(pairAddress);
              }}
            />
          )),
          ...ambientPairs.map((pair) => (
            <GeneralAmbientPairRow
              key={pair.symbol}
              pair={pair}
              onAddLiquidity={(pairAddress) => setPair(pairAddress)}
            />
          )),
        ]}
      />
      <Spacer height="40px" />
    </div>
  );
}
