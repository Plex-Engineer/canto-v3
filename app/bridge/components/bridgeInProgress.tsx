import TxItem from "@/components/transactions/TxItem";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { TransactionFlowType } from "@/transactions/flows";
import { TransactionWithStatus } from "@/transactions/interfaces";
import { useMemo } from "react";

type InProgressTx = TransactionWithStatus & {
  txIndex: number;
  flowId: string;
};

interface Props {}
const BridgeInProgress = ({}: Props) => {
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
          if (tx.tx.bridge && tx.tx.bridge?.lastStatus !== "SUCCESS") {
            pendingTxs.push({ ...tx, txIndex: idx, flowId: flow.id });
          }
        });
      }
    });

    return pendingTxs;
  }, [signer?.account.address, txStore]);

  return (
    <div>
      {inProgressTxs.map((tx, idx) => (
        <TxItem
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
      ))}
    </div>
  );
};

export default BridgeInProgress;
