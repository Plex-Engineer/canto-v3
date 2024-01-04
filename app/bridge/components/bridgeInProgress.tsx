import Container from "@/components/container/container";
import Text from "@/components/text";
import {
  TransactionStatus,
  TransactionWithStatus,
} from "@/transactions/interfaces";
import InProgressTxItem from "./inProgressItem";

const BridgeInProgress = ({
  txs,
  clearTxs,
  setTxBridgeStatus,
}: {
  txs: {
    pending: Array<
      TransactionWithStatus & {
        txIndex: number;
        flowId: string;
      }
    >;
    completed: Array<
      TransactionWithStatus & {
        txIndex: number;
        flowId: string;
      }
    >;
  };
  clearTxs: () => void;
  setTxBridgeStatus: (
    flowId: string,
    txIndex: number,
    lastStatus: TransactionStatus,
    timeLeft: number | undefined
  ) => void;
}) => {
  const allTxs = [...txs.pending, ...txs.completed];
  return (
    <Container height="468px" padding="lg" style={{ overflowY: "scroll" }}>
      {allTxs.length > 0 ? (
        <>
          <Text
            size="sm"
            role="button"
            style={{
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={clearTxs}
          >
            clear completed transactions
          </Text>

          {allTxs.map((tx, idx) => (
            <InProgressTxItem
              key={idx}
              tx={tx}
              setBridgeStatus={(status) =>
                setTxBridgeStatus(
                  tx.flowId,
                  tx.txIndex,
                  status.status,
                  status.completedIn
                )
              }
            />
          ))}
        </>
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
            No pending transactions. To check history click the activity icon in
            the navigation bar.
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default BridgeInProgress;
