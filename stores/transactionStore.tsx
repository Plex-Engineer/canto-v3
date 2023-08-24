import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  Transaction,
  TransactionWithStatus,
} from "@/config/interfaces/transactions";
import {
  performSingleTransaction,
  waitForTransaction,
} from "@/utils/baseTransaction.utils";
import { getNetworkInfoFromChainId } from "@/utils/networks.utils";
import { GetWalletClientResult } from "wagmi/actions";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface TransactionStore {
  transactions: TransactionWithStatus[][];
  addTransactions: (
    txList: Transaction[],
    signer?: GetWalletClientResult
  ) => PromiseWithError<boolean>;
  // will delete all transactions in list index, or the entire store if no index provided
  clearTransactions: (listIndex?: number) => void;
  performTransactions: (
    signer: GetWalletClientResult,
    overrides?: {
      txListIndex?: number;
      txIndex?: number;
    }
  ) => PromiseWithError<boolean>;
  // this should only be called internally
  setTxStatus: (
    listIndex: number,
    txIndex: number,
    details: Partial<TransactionWithStatus>
  ) => void;
}

const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactions: [],
        addTransactions: async (txList, signer) => {
          const txListWithStatus: TransactionWithStatus[] = txList.map(
            (tx) => ({
              tx,
              status: "NONE",
            })
          );
          set({ transactions: [...get().transactions, txListWithStatus] });
          // if signer, we can perform the transactions right away
          if (signer) {
            return await get().performTransactions(signer);
          }
          return NO_ERROR(true);
        },
        clearTransactions: (listIndex) => {
          if (!listIndex) {
            set({ transactions: [] });
          } else {
            const oldTxList = get().transactions;
            set({
              transactions: [
                ...oldTxList.slice(0, listIndex),
                ...oldTxList.slice(listIndex + 1),
              ],
            });
          }
        },
        performTransactions: async (signer, overrides) => {
          // start with the most recent if none provided
          const listIndex =
            overrides?.txListIndex || get().transactions.length - 1;
          const txIndex = overrides?.txIndex || 0;
          const transactions = get().transactions[listIndex];
          try {
            for (let i = txIndex; i < transactions.length; i++) {
              // set pending since about to be signed
              get().setTxStatus(listIndex, i, { status: "SIGNING" });
              // request signature and receive txHash once signed
              const { data: txHash, error: txError } =
                await performSingleTransaction(transactions[i].tx, signer);
              // if error with signature, set status and throw error
              if (txError) {
                get().setTxStatus(listIndex, i, {
                  status: "ERROR",
                  error: txError,
                });
                throw Error(
                  "transactionStore::performTransaction::" + txError.message
                );
              }
              // we have a txHash so we can set status to pending
              get().setTxStatus(listIndex, i, {
                status: "PENDING",
                hash: txHash,
                txLink: getNetworkInfoFromChainId(
                  transactions[i].tx.chainId
                ).data.blockExplorer?.getTransactionLink(txHash),
              });
              // wait for the result before moving on
              const { data: receipt, error: txReceiptError } =
                await waitForTransaction(
                  transactions[i].tx.type,
                  transactions[i].tx.chainId,
                  txHash
                );
              // check receipt for error
              if (txReceiptError || receipt.status !== "success") {
                get().setTxStatus(listIndex, i, {
                  status: "ERROR",
                  error: new Error(receipt.error),
                });
                throw Error(receipt.error);
              }

              // transaction was a success so we can set status and
              get().setTxStatus(listIndex, i, {
                status: "SUCCESS",
              });
            }
          } catch (err) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: " + errMsg(err)
            );
          }

          return NO_ERROR(true);
        },
        setTxStatus: (listIndex, txIndex, details) => {
          const oldTxList = get().transactions;
          const updatedTx = { ...oldTxList[listIndex][txIndex], ...details };
          set({
            transactions: [
              ...oldTxList.slice(0, listIndex),
              [
                ...oldTxList[listIndex].slice(0, txIndex),
                updatedTx,
                ...oldTxList[listIndex].slice(txIndex + 1),
              ],
              ...oldTxList.slice(listIndex + 1),
            ],
          });
        },
      }),
      {
        name: "transaction-store",
        version: 1,
      }
    )
  )
);

// this is a hack to get around the fact that BigInts are not supported by JSON.stringify
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default useTransactionStore;
