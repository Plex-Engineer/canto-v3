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
  txs: Array<
    TransactionWithStatus & {
      txIndex: number;
      flowId: string;
    }
  >;
  clearTxs: () => void;
  setTxBridgeStatus: (
    flowId: string,
    txIndex: number,
    lastStatus: TransactionStatus,
    timeLeft: number | undefined
  ) => void;
}) => {
  return (
    <Container height="468px" padding="lg" style={{ overflowY: "scroll" }}>
      {txs.length > 0 ? (
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
            clear all transactions
          </Text>

          {txs.map((tx, idx) => (
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
            You have no pending transactions. To check history please click on
            the transactions icon in the navbar.
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default BridgeInProgress;
