import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  Transaction,
  TransactionFlowWithStatus,
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

interface AddTransactionsParams {
  title: string;
  txList: Transaction[];
  signer?: GetWalletClientResult;
}
export interface TransactionStore {
  transactionFlows: TransactionFlowWithStatus[];
  addTransactions: (params: AddTransactionsParams) => PromiseWithError<boolean>;
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
  setTxFlowStatus: (
    listIndex: number,
    details: Partial<TransactionFlowWithStatus>
  ) => void;
}

const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactionFlows: [],
        addTransactions: async (params) => {
          const txListWithStatus: TransactionFlowWithStatus = {
            title: params.title,
            status: "NONE",
            transactions: params.txList.map((tx) => ({
              tx,
              status: "NONE",
            })),
          };
          set({
            transactionFlows: [...get().transactionFlows, txListWithStatus],
          });
          // if signer, we can perform the transactions right away
          if (params.signer) {
            return await get().performTransactions(params.signer);
          }
          return NO_ERROR(true);
        },
        clearTransactions: (listIndex) => {
          if (!listIndex) {
            set({ transactionFlows: [] });
          } else {
            const oldTxList = get().transactionFlows;
            set({
              transactionFlows: [
                ...oldTxList.slice(0, listIndex),
                ...oldTxList.slice(listIndex + 1),
              ],
            });
          }
        },
        performTransactions: async (signer, overrides) => {
          // start with the most recent if none provided
          const listIndex =
            overrides?.txListIndex || get().transactionFlows.length - 1;
          const transactionFlow = get().transactionFlows[listIndex];
          // check that we have a transaction flow object
          if (!transactionFlow) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: no transactions found"
            );
          }
          // set the flow status to pending now that we will be performing the transactions
          get().setTxFlowStatus(listIndex, { status: "PENDING" });

          // get the transactions
          const transactions = transactionFlow.transactions;
          const txIndex = overrides?.txIndex || 0;

          // go through each transaction and perform it
          for (let i = txIndex; i < transactions.length; i++) {
            try {
              // set pending since about to be signed
              // reset error, hash, and txLink since new tx
              get().setTxStatus(listIndex, i, {
                status: "SIGNING",
                error: undefined,
                hash: undefined,
                txLink: undefined,
              });
              // request signature and receive txHash once signed
              const { data: txHash, error: txError } =
                await performSingleTransaction(transactions[i].tx, signer);
              // if error with signature, set status and throw error
              if (txError) {
                // set tx status to error
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
            } catch (err) {
              // something failed, so set the flow to failure
              get().setTxFlowStatus(listIndex, { status: "ERROR" });
              return NEW_ERROR(
                "useTransactionStore::performTransactions: " + errMsg(err)
              );
            }
          }
          // made it through the whole list, so the flow was a success
          get().setTxFlowStatus(listIndex, { status: "SUCCESS" });
          return NO_ERROR(true);
        },
        setTxStatus: (listIndex, txIndex, details) => {
          const oldTxList = get().transactionFlows;
          const currentFlow = oldTxList[listIndex];
          const updatedTx = {
            ...currentFlow.transactions[txIndex],
            ...details,
          };
          set({
            transactionFlows: [
              ...oldTxList.slice(0, listIndex),
              {
                ...currentFlow,
                transactions: [
                  ...currentFlow.transactions.slice(0, txIndex),
                  updatedTx,
                  ...currentFlow.transactions.slice(txIndex + 1),
                ],
              },
              ...oldTxList.slice(listIndex + 1),
            ],
          });
        },
        setTxFlowStatus: (listIndex, details) => {
          const currentFlow = get().transactionFlows[listIndex];
          const updatedFlow = { ...currentFlow, ...details };
          set({
            transactionFlows: [
              ...get().transactionFlows.slice(0, listIndex),
              updatedFlow,
              ...get().transactionFlows.slice(listIndex + 1),
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
