"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { PairsTransactionParams } from "@/hooks/pairs/interfaces/pairsTxTypes";
import usePairs from "@/hooks/pairs/usePairs";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { ValidationReturn } from "@/config/interfaces";
import { GeneralPairRow, UserPairRow } from "./components/pairRow";
import Text from "@/components/text";
import { TestEditModal } from "./components/liquidityModal";
import styles from "./lp.module.scss";

export default function Page() {
  const { data: signer } = useWalletClient();
  const chainId = signer?.chain.id === 7701 ? 7701 : 7700;

  const txStore = useStore(useTransactionStore, (state) => state);
  const { pairs, transaction, selection } = usePairs({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });
  const sortedPairs = pairs?.sort((a, b) => a.symbol.localeCompare(b.symbol));
  const userPairs = pairs.filter(
    (pair) =>
      pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
      pair.clmData?.userDetails?.balanceOfUnderlying !== "0"
  );
  const { setPair, pair: selectedPair } = selection;

  // transactions
  function sendTxFlow(params: Partial<PairsTransactionParams>) {
    const { data: flow, error } = transaction.createNewPairsFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as PairsTransactionParams);
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({ txFlow: flow, signer: signer });
    }
  }
  function canPerformTx(
    params: Partial<PairsTransactionParams>
  ): ValidationReturn {
    return transaction.validateParams({
      chainId: signer?.chain.id ?? 7700,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as PairsTransactionParams);
  }

  //main content
  return (
    <div className={styles.container}>
      <Modal open={selectedPair !== null} onClose={() => setPair(null)}>
        {selectedPair && (
          <TestEditModal
            pair={selectedPair}
            validateParams={canPerformTx}
            sendTxFlow={sendTxFlow}
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
    </div>
  );
}
