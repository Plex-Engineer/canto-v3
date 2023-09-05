import React from "react";
import Modal from "../modal/modal";
import Button from "../button/button";
import Icon from "../icon/icon";
import TransactionBox from "./TxBox";
import TxUnused from "./TxUnused";

const TransactionModal = () => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] =
    React.useState(false);
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
        {/* <TransactionBox /> */}
        <TxUnused />
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
