"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { ValidationReturn } from "@/config/interfaces";
import { GeneralPairRow, UserPairRow } from "./components/pairRow";
import Text from "@/components/text";
import { TestEditModal } from "./components/cantoDexLPModal";
import styles from "./lp.module.scss";
import { CantoDexTransactionParams } from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import useLP from "@/hooks/pairs/lpCombo/useLP";
import {
  isAmbientPair,
  isCantoDexPair,
} from "@/hooks/pairs/lpCombo/interfaces.ts/pairTypes";
import Button from "@/components/button/button";
import { TestAmbientModal } from "./components/ambientLPModal";
import { AmbientTransactionParams } from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";

export default function Page() {
  const { data: signer } = useWalletClient();
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
  const userPairs = cantoDexPairs.filter(
    (pair) =>
      pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
      pair.clmData?.userDetails?.balanceOfUnderlying !== "0"
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
      txStore?.addNewFlow({ txFlow: flow, signer: signer });
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

  /** AMBIENT */
  const { ambientPairs } = ambient;

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
      txStore?.addNewFlow({ txFlow: flow, signer: signer });
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

  //main content
  return (
    <div className={styles.container}>
      <Modal open={selectedPair !== null} onClose={() => setPair(null)}>
        {selectedPair && isCantoDexPair(selectedPair) && (
          <TestEditModal
            pair={selectedPair}
            validateParams={canPerformCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPair(selectedPair) && (
          <TestAmbientModal
            pair={selectedPair}
            validateParams={canPerformAmbientTx}
            sendTxFlow={sendAmbientTxFlow}
          />
        )}
      </Modal>
      <Text size="x-lg" className={styles.title}>
        LP Interface
      </Text>
      <Spacer height="30px" />
      {userPairs.length > 0 && (
        <Table
          title="Your Pairs"
          headers={[
            "Pair",
            "APR",
            "Pool Share",
            "Value",
            "# LP Tokens",
            "# Staked",
            "Rewards",
            "Edit",
          ]}
          columns={9}
          processedData={userPairs.map((pair) => (
            <UserPairRow
              key={pair.symbol}
              pair={pair}
              onAddLiquidity={(pairAddress) => {
                setPair(pairAddress);
              }}
              onRemoveLiquidity={(pairAddress) => {
                setPair(pairAddress);
              }}
            />
          ))}
        />
      )}
      <Spacer height="40px" />
      <Table
        title="All Pairs"
        headers={["Pair", "APR", "TVL", "Type", "action"]}
        columns={6}
        processedData={sortedPairs.map((pair) => (
          <GeneralPairRow
            key={pair.symbol}
            pair={pair}
            onAddLiquidity={(pairAddress) => {
              setPair(pairAddress);
            }}
          />
        ))}
      />
      <Spacer height="40px" />
      <Table
        title="AmbientPairs"
        headers={["Pair", "action"]}
        columns={3}
        processedData={ambientPairs.map((pair) => [
          <div key={pair.symbol}>{pair.symbol}</div>,
          <Button key={"action item"} onClick={() => setPair(pair.address)}>
            add liquidity
          </Button>,
        ])}
      />
      <Spacer height="40px" />
    </div>
  );
}
