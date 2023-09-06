import { useState, useEffect } from "react";
import Modal from "../modal/modal";
import Button from "../button/button";
import Icon from "../icon/icon";
import TxUnused from "./TxUnused";
import useStore from "@/stores/useStore";
import useTransactionStore from "@/stores/transactionStore";
import { useWalletClient } from "wagmi";

const TransactionModal = () => {
  // connected signer
  const { data: signer } = useWalletClient();
  // transaction store
  const txStore = useStore(useTransactionStore, (state) => state);
  // set modal open state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // get transaction flows for user
  const transactionFlows = txStore?.getUserTransactionFlows(
    signer?.account.address ?? ""
  );
  const mostRecentFlow = transactionFlows?.[transactionFlows.length - 1];

  // open if transaction is loading in
  useEffect(() => {
    if (txStore?.isLoading) {
      setIsTransactionModalOpen(true);
    }
  }, [txStore?.isLoading]);
  return (
    <>
      <Modal
        open={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
        }}
        height="36rem"
        width="30rem"
      >
        <TxUnused
          txFlow={mostRecentFlow}
          onRetry={(txIdx) => {
            txStore?.performTransactions(signer, {
              txListIndex: (transactionFlows?.length ?? 0) - 1,
              txIndex: txIdx,
            });
          }}
        />
        {/* <Button
          color="accent"
          onClick={() =>
            txStore?.clearTransactions(signer?.account.address ?? "")
          }
        >
          CLEAR ALL TXS
        </Button> */}
      </Modal>
      <Button
        color="secondary"
        padding={10}
        height={40}
        onClick={() => {
          setIsTransactionModalOpen(true);
        }}
      >
        <Icon
          icon={{
            url: "transactions.svg",
            size: 24,
          }}
        />
      </Button>
    </>
  );
};

export default TransactionModal;
