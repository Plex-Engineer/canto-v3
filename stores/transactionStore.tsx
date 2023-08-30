import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  Transaction,
  TransactionFlowStatus,
  TransactionFlowWithStatus,
  TransactionWithStatus,
  UserTransactionFlowMap,
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
  txList: () => PromiseWithError<Transaction[]>;
  ethAccount: string;
  signer?: GetWalletClientResult;
}
export interface TransactionStore {
  // will tell the tx store if a transaction flow is currently being prepared
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  transactionFlows: UserTransactionFlowMap;
  getUserTransactionFlows: (ethAccount: string) => TransactionFlowWithStatus[];
  addTransactions: (params: AddTransactionsParams) => PromiseWithError<boolean>;
  // will delete all transactions in list index, or the entire store if no index provided
  clearTransactions: (ethAccount: string, listIndex?: number) => void;
  performTransactions: (
    signer: GetWalletClientResult | undefined,
    overrides?: {
      txListIndex?: number;
      txIndex?: number;
    }
  ) => PromiseWithError<boolean>;
  // this should only be called internally
  setTxStatus: (
    ethAccount: string,
    listIndex: number,
    txIndex: number,
    details: Partial<TransactionWithStatus>
  ) => void;
  setTxFlowStatus: (
    ethAddress: string,
    listIndex: number,
    status: TransactionFlowStatus
  ) => void;
}

const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        isLoading: false,
        // should never be called by any other component
        setLoading: (loading) => set({ isLoading: loading }),
        transactionFlows: new Map<string, TransactionFlowWithStatus[]>(),
        getUserTransactionFlows: (ethAccount) => {
          const userTxFlows = get().transactionFlows.get(ethAccount);
          return userTxFlows || [];
        },
        addTransactions: async (params) => {
          // set loading state to true
          set({ isLoading: true });
          // run the function to get all transactions
          const { data: txList, error } = await params.txList();
          if (error) {
            set({ isLoading: false });
            return NEW_ERROR(
              "useTransactionStore::addTransactions: " + errMsg(error)
            );
          }
          const txListWithStatus: TransactionFlowWithStatus = {
            title: params.title,
            status: "NONE",
            transactions: txList.map((tx) => ({
              tx,
              status: "NONE",
            })),
          };
          // add the flow to the user map
          const currentUserTransactionFlows = get().getUserTransactionFlows(
            params.ethAccount
          );
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(params.ethAccount, [
                ...currentUserTransactionFlows,
                txListWithStatus,
              ])
            ),
            isLoading: false,
          });
          // if signer, we can perform the transactions right away
          if (params.signer) {
            return await get().performTransactions(params.signer);
          }
          return NO_ERROR(true);
        },
        clearTransactions: (ethAccount, listIndex) => {
          const txFlows = get().transactionFlows;
          if (!listIndex) {
            txFlows.delete(ethAccount);
            set({ transactionFlows: txFlows });
          } else {
            const userTxList = txFlows.get(ethAccount);
            if (!userTxList || !userTxList[listIndex]) {
              // nothing to delete
              return;
            }
            // delete the list
            const updatedUserFlows = [
              ...userTxList.slice(0, listIndex),
              ...userTxList.slice(listIndex + 1),
            ];
            set({
              transactionFlows: txFlows.set(ethAccount, updatedUserFlows),
            });
          }
        },
        performTransactions: async (signer, overrides) => {
          // make sure signer is here
          if (!signer) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: no signer provided"
            );
          }
          const ethAddress = signer.account.address;
          // grab user flows
          const userTxFlows = get().getUserTransactionFlows(ethAddress);
          if (userTxFlows.length === 0) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: no transactions found"
            );
          }
          // start with the most recent if none provided
          const listIndex = overrides?.txListIndex || userTxFlows.length - 1;
          const transactionFlow = userTxFlows[listIndex];
          // check that we have a transaction flow object
          if (!transactionFlow) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: no transactions found at index " +
                listIndex
            );
          }
          // set the flow status to pending now that we will be performing the transactions
          get().setTxFlowStatus(ethAddress, listIndex, "PENDING");

          // get the transactions
          const transactions = transactionFlow.transactions;
          const txIndex = overrides?.txIndex || 0;

          // go through each transaction and perform it
          for (let i = txIndex; i < transactions.length; i++) {
            try {
              // set pending since about to be signed
              // reset error, hash, and txLink since new tx
              get().setTxStatus(ethAddress, listIndex, i, {
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
                get().setTxStatus(ethAddress, listIndex, i, {
                  status: "ERROR",
                  error: txError,
                });
                throw Error(
                  "transactionStore::performTransaction::" + txError.message
                );
              }
              // we have a txHash so we can set status to pending
              get().setTxStatus(ethAddress, listIndex, i, {
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
                get().setTxStatus(ethAddress, listIndex, i, {
                  status: "ERROR",
                  error: new Error(receipt.error),
                });
                throw Error(receipt.error);
              }
              // transaction was a success so we can set status and
              get().setTxStatus(ethAddress, listIndex, i, {
                status: "SUCCESS",
              });
            } catch (err) {
              // something failed, so set the flow to failure
              get().setTxFlowStatus(ethAddress, listIndex, "ERROR");
              return NEW_ERROR(
                "useTransactionStore::performTransactions: " + errMsg(err)
              );
            }
          }
          // made it through the whole list, so the flow was a success
          get().setTxFlowStatus(ethAddress, listIndex, "SUCCESS");
          return NO_ERROR(true);
        },
        setTxStatus: (ethAccount, listIndex, txIndex, details) => {
          // called internally, no need to check any of the params
          const currentUserTxFlows = get().getUserTransactionFlows(ethAccount);
          // save updates
          const updatedTx = {
            ...currentUserTxFlows[listIndex].transactions[txIndex],
            ...details,
          };
          const updatedFlow = {
            ...currentUserTxFlows[listIndex],
            transactions: [
              ...currentUserTxFlows[listIndex].transactions.slice(0, txIndex),
              updatedTx,
              ...currentUserTxFlows[listIndex].transactions.slice(txIndex + 1),
            ],
          };
          // set state
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(ethAccount, [
                ...currentUserTxFlows.slice(0, listIndex),
                updatedFlow,
                ...currentUserTxFlows.slice(listIndex + 1),
              ])
            ),
          });
        },
        setTxFlowStatus: (ethAddress, listIndex, status) => {
          // called internally, no need to check any of the params
          const currentUserTxFlows = get().getUserTransactionFlows(ethAddress);
          const updatedFlow = { ...currentUserTxFlows[listIndex], status };

          // set new flows
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(ethAddress, [
                ...currentUserTxFlows.slice(0, listIndex),
                updatedFlow,
                ...currentUserTxFlows.slice(listIndex + 1),
              ])
            ),
          });
        },
      }),
      {
        name: "canto-io-transaction-store",
        version: 1,
        storage: {
          getItem: (key) => {
            const jsonStr = localStorage.getItem(key);
            if (!jsonStr) return null;
            const { state } = JSON.parse(jsonStr);
            return {
              state: {
                ...state,
                transactionFlows: new Map(state.transactionFlows),
              },
            };
          },
          setItem: (key, value) => {
            const jsonStr = JSON.stringify({
              state: {
                ...value.state,
                transactionFlows: Array.from(
                  value.state.transactionFlows.entries()
                ),
              },
            });
            localStorage.setItem(key, jsonStr);
          },
          removeItem: (key) => localStorage.removeItem(key),
        },
        onRehydrateStorage: () => (state) => {
          // reset isLoading to false, since we just reloaded the page
          state?.setLoading(false);
        },
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
