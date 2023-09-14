import { useState, useEffect } from "react";
import Modal from "../modal/modal";
import Button from "../button/button";
import Icon from "../icon/icon";
import TxFlow from "./TxFlow";
import useStore from "@/stores/useStore";
import useTransactionStore from "@/stores/transactionStore";
import { useWalletClient } from "wagmi";
import Container from "../container/container";
import Text from "../text";
import styles from "./transactions.module.scss";
import Spacer from "../layout/spacer";
import clsx from "clsx";
import StatusIcon from "../icon/statusIcon";
import Splash from "../splash/splash";

const TransactionModal = () => {
  // set modal open state
  const [isOpen, setIsOpen] = useState(false);
  // state for current selected flow
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);

  // connected signer
  const { data: signer } = useWalletClient();
  // transaction store
  const txStore = useStore(useTransactionStore, (state) => state);

  // get transaction flows for user
  const transactionFlows = txStore?.getUserTransactionFlows(
    signer?.account.address ?? ""
  );

  function getFlowFromId(id: string) {
    return transactionFlows?.find((flow) => flow.id === id);
  }

  // open if transaction is loading in
  useEffect(() => {
    if (transactionFlows) {
      transactionFlows.forEach((flow) => {
        if (flow.status === "POPULATING") {
          setIsOpen(true);
          setCurrentFlowId(flow.id);
          return;
        }
      });
    }
  }, [transactionFlows]);
  return (
    <>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        height="36rem"
        width="30rem"
      >
        <Text size="lg" font="proto_mono">
          Activity
        </Text>
        {/* {txStore?.isLoading ? ( */}
        {false ? (
          <Container
            height="calc(100% - 30px)"
            center={{
              vertical: true,
              horizontal: true,
            }}
          >
            <Container height="300px">
              <Splash height="300px" width="300px" />
            </Container>
            <Text size="lg" font="proto_mono">
              loading...
            </Text>
          </Container>
        ) : transactionFlows && transactionFlows?.length > 0 ? (
          <div className={styles["scroll-view"]}>
            {/* <Spacer height="10px" /> */}
            <div className={clsx(styles["items-list"])}>
              {transactionFlows
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map((flow, idx) => (
                  <Container
                    key={idx}
                    width="100%"
                    direction="row"
                    gap={20}
                    center={{
                      vertical: true,
                    }}
                    className={styles.item}
                    onClick={() => {
                      setCurrentFlowId(flow.id);
                    }}
                  >
                    <div className={styles.txImg}>
                      <StatusIcon status={flow.status} size={24} />
                    </div>
                    <Text>{flow.title}</Text>
                    <div
                      style={{
                        transform: !(flow.id === currentFlowId)
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <Icon
                        icon={{
                          url: "dropdown.svg",
                          size: 24,
                        }}
                      />
                    </div>
                  </Container>
                ))}
              <Spacer height="100%" />

              <Button
                color="secondary"
                height={"small"}
                onClick={() =>
                  txStore?.clearTransactions(signer?.account.address ?? "")
                }
              >
                CLEAR ALL TXS
              </Button>
            </div>
            <Container
              className={clsx(styles["grp-items"])}
              style={{
                transform: currentFlowId ? "translateX(0)" : "translateX(100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                }}
              >
                <Container
                  direction="row"
                  gap={20}
                  className={styles.item}
                  width="120px"
                  height="50px"
                  center={{
                    vertical: true,
                  }}
                  onClick={() => {
                    setCurrentFlowId(null);
                  }}
                >
                  <div
                    style={{
                      transform: "rotate(90deg)",
                    }}
                  >
                    <Icon
                      icon={{
                        url: "dropdown.svg",
                        size: 24,
                      }}
                    />
                  </div>
                  <Text size="sm" font="proto_mono">
                    Back
                  </Text>
                </Container>
              </div>
              {currentFlowId && getFlowFromId(currentFlowId) && (
                <TxFlow
                  txFlow={getFlowFromId(currentFlowId)}
                  onRetry={() => {
                    txStore?.performFlow(signer, currentFlowId);
                  }}
                  setBridgeStatus={(txIndex, status) =>
                    txStore?.setTxBridgeStatus(
                      signer?.account.address ?? "",
                      currentFlowId,
                      txIndex,
                      status
                    )
                  }
                />
              )}
            </Container>
          </div>
        ) : (
          <Container
            height="calc(100% - 30px)"
            center={{
              vertical: true,
              horizontal: true,
            }}
          >
            <Text size="lg" font="proto_mono">
              no recent transactions
            </Text>
          </Container>
        )}
      </Modal>
      <Button
        color="secondary"
        padding={10}
        height={40}
        onClick={() => {
          setIsOpen(true);
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
