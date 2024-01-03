import { useMemo } from "react";
import useCantoSigner from "../helpers/useCantoSigner";
import {
  TransactionStatus,
  TransactionWithStatus,
} from "@/transactions/interfaces";
import { TransactionFlowType } from "@/transactions/flows";

type InProgressTx = TransactionWithStatus & {
  txIndex: number;
  flowId: string;
};
export default function useBridgingInProgess() {
  const { signer, txStore } = useCantoSigner();

  const inProgressTxs = useMemo(() => {
    // get all flows
    const flows = txStore?.getUserTransactionFlows(
      signer?.account.address ?? ""
    );
    if (!flows) return { pending: [], completed: [] };

    const pendingTxs: InProgressTx[] = [];
    const completedTxs: InProgressTx[] = [];

    flows.forEach((flow) => {
      // filter by bridge flow type
      if (flow.txType === TransactionFlowType.BRIDGE) {
        // separate txs with bridge flag and status of pending
        flow.transactions.forEach((tx, idx) => {
          if (tx.tx.bridge && tx.tx.bridge.showInProgress) {
            tx.tx.bridge.lastStatus === "PENDING"
              ? pendingTxs.push({ ...tx, txIndex: idx, flowId: flow.id })
              : completedTxs.push({ ...tx, txIndex: idx, flowId: flow.id });
          }
        });
      }
    });

    return {
      pending: pendingTxs.sort(
        (a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)
      ),
      completed: completedTxs.sort(
        (a, b) => Number(b.timestamp ?? 0) - Number(a.timestamp ?? 0)
      ),
    };
  }, [signer?.account.address, txStore]);

  function clearTxs() {
    inProgressTxs.completed.forEach((tx) => {
      txStore?.setTxBridgeStatus(
        signer?.account.address ?? "",
        tx.flowId,
        tx.txIndex,
        { showInProgress: false }
      );
    });
  }

  function setTxBridgeStatus(
    flowId: string,
    txIndex: number,
    lastStatus: TransactionStatus,
    timeLeft?: number
  ) {
    txStore?.setTxBridgeStatus(signer?.account.address ?? "", flowId, txIndex, {
      lastStatus,
      timeLeft,
    });
  }

  return { inProgressTxs, clearTxs, setTxBridgeStatus };
}
