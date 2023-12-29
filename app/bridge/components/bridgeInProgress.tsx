import Container from "@/components/container/container";
import Text from "@/components/text";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { TransactionFlowType } from "@/transactions/flows";
import { TransactionWithStatus } from "@/transactions/interfaces";
import { useMemo } from "react";
import InProgressTxItem from "./inProgressItem";

type InProgressTx = TransactionWithStatus & {
  txIndex: number;
  flowId: string;
};

const BridgeInProgress = () => {
  const { signer, txStore } = useCantoSigner();

  const inProgressTxs = useMemo(() => {
    // get all flows
    const flows = txStore?.getUserTransactionFlows(
      signer?.account.address ?? ""
    );
    if (!flows) return [];

    const pendingTxs: InProgressTx[] = [];

    flows.forEach((flow) => {
      // filter by bridge flow type
      if (flow.txType === TransactionFlowType.BRIDGE) {
        // separate txs with bridge flag and status of pending
        flow.transactions.forEach((tx, idx) => {
          if (tx.tx.bridge) {
            pendingTxs.push({ ...tx, txIndex: idx, flowId: flow.id });
          }
        });
      }
    });

    return pendingTxs.sort(
      (a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)
    );
  }, [signer?.account.address, txStore]);

  return (
    <Container height="468px" padding="lg" style={{ overflowY: "scroll" }}>
      {inProgressTxs.length > 0 ? (
        inProgressTxs.map((tx, idx) => (
          <InProgressTxItem
            key={idx}
            tx={tx}
            idx={idx}
            setBridgeStatus={(status) => {
              txStore?.setTxBridgeStatus(
                signer?.account.address ?? "",
                tx.flowId,
                tx.txIndex,
                status
              );
            }}
          />
        ))
      ) : (
        <Container
          height="100%"
          center={{
            horizontal: true,
            vertical: true,
          }}
        >
          <Text
            theme="secondary-dark"
            size="sm"
            style={{
              textAlign: "center",
              width: "80%",
            }}
          >
            You have no pending transactions. To check history please click on
            the transactions icon in the navbar.
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default BridgeInProgress;
