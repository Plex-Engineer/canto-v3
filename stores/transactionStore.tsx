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
  icon: string;
  txList: () => PromiseWithError<Transaction[]>;
  ethAccount: string;
  signer?: GetWalletClientResult;
}
export interface TransactionStore {
  // will tell the tx store which current flow id is loading
  isLoading: string | null;
  setLoading: (loading: string | null) => void;
  transactionFlows: UserTransactionFlowMap;
  getUserTransactionFlows: (ethAccount: string) => TransactionFlowWithStatus[];
  addTransactions: (params: AddTransactionsParams) => PromiseWithError<boolean>;
  // will delete the flow with the id provided, or the entire store if no index provided
  clearTransactions: (ethAccount: string, flowId?: string) => void;
  performTransactions: (
    signer: GetWalletClientResult | undefined,
    overrides?: {
      flowId?: string;
      txIndex?: number;
    }
  ) => PromiseWithError<boolean>;
  // this should only be called internally
  setTxStatus: (
    ethAccount: string,
    flowId: string,
    txIndex: number,
    details: Partial<TransactionWithStatus>
  ) => void;
  setTxFlowStatus: (
    ethAddress: string,
    flowId: string,
    status: TransactionFlowStatus
  ) => void;
}

const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        isLoading: null,
        // should never be called by any other component
        setLoading: (loading) => set({ isLoading: loading }),
        transactionFlows: new Map<string, TransactionFlowWithStatus[]>(),
        getUserTransactionFlows: (ethAccount) => {
          const userTxFlows = get().transactionFlows.get(ethAccount);
          return userTxFlows || [];
        },
        addTransactions: async (params) => {
          // random id for the flow
          const flowId = Date.now().toString() + Math.random().toString();
          // set loading state to true
          set({ isLoading: flowId });
          // run the function to get all transactions
          const { data: txList, error } = await params.txList();
          if (error) {
            set({ isLoading: null });
            return NEW_ERROR(
              "useTransactionStore::addTransactions: " + errMsg(error)
            );
          }
          // create flow object with random id
          const txListWithStatus: TransactionFlowWithStatus = {
            id: flowId,
            title: params.title,
            icon: params.icon,
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
            isLoading: null,
          });
          // if signer, we can perform the transactions right away
          if (params.signer) {
            return await get().performTransactions(params.signer);
          }
          return NO_ERROR(true);
        },
        clearTransactions: (ethAccount, flowId) => {
          const txFlows = get().transactionFlows;
          if (!flowId) {
            txFlows.delete(ethAccount);
            set({ transactionFlows: txFlows });
          } else {
            const userTxFlows = txFlows.get(ethAccount);
            if (!userTxFlows) {
              // nothing to delete
              return;
            }
            // delete the flow
            const updatedUserFlows = userTxFlows?.filter(
              (flow) => flow.id !== flowId
            );
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
          const flowToPerform = overrides?.flowId
            ? userTxFlows.find((flow) => flow.id === overrides.flowId)
            : userTxFlows[userTxFlows.length - 1];
          // check that we have a transaction flow object
          if (!flowToPerform) {
            return NEW_ERROR(
              "useTransactionStore::performTransactions: no transactions found"
            );
          }
          // set the flow status to pending now that we will be performing the transactions
          get().setTxFlowStatus(ethAddress, flowToPerform.id, "PENDING");

          // get the transactions
          const transactions = flowToPerform.transactions;
          const txIndex = overrides?.txIndex || 0;

          // go through each transaction and perform it
          for (let i = txIndex; i < transactions.length; i++) {
            try {
              // set pending since about to be signed
              // reset error, hash, and txLink since new tx
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "SIGNING",
                error: undefined,
                hash: undefined,
                txLink: undefined,
                timestamp: undefined,
              });
              // request signature and receive txHash once signed
              const { data: txHash, error: txError } =
                await performSingleTransaction(transactions[i].tx, signer);
              // if error with signature, set status and throw error
              if (txError) {
                // set tx status to error
                get().setTxStatus(ethAddress, flowToPerform.id, i, {
                  status: "ERROR",
                  error: txError,
                  timestamp: new Date().getTime(),
                });
                throw Error(
                  "transactionStore::performTransaction::" + txError.message
                );
              }
              // we have a txHash so we can set status to pending
              // to get the txLink, we can grab it from the chainId,
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "PENDING",
                hash: txHash,
                txLink: getNetworkInfoFromChainId(
                  transactions[i].tx.chainId
                ).data.blockExplorer?.getTransactionLink(txHash),
                timestamp: new Date().getTime(),
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
                get().setTxStatus(ethAddress, flowToPerform.id, i, {
                  status: "ERROR",
                  error: new Error(receipt.error),
                });
                throw Error(receipt.error);
              }
              // transaction was a success so we can set status and
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "SUCCESS",
              });
            } catch (err) {
              // something failed, so set the flow to failure
              get().setTxFlowStatus(ethAddress, flowToPerform.id, "ERROR");
              return NEW_ERROR(
                "useTransactionStore::performTransactions: " + errMsg(err)
              );
            }
          }
          // made it through the whole list, so the flow was a success
          get().setTxFlowStatus(ethAddress, flowToPerform.id, "SUCCESS");
          return NO_ERROR(true);
        },
        setTxStatus: (ethAccount, flowId, txIndex, details) => {
          // find the flow we need to update the tx in
          const currentUserTxFlows = get().getUserTransactionFlows(ethAccount);
          const flowToUpdate = currentUserTxFlows.find(
            (flow) => flow.id === flowId
          );
          if (!flowToUpdate) {
            return;
          }
          // create new tx with details
          const updatedTx = {
            ...flowToUpdate.transactions[txIndex],
            ...details,
          };
          // create new tx List
          const updatedTxList = flowToUpdate.transactions.map((tx, idx) =>
            idx === txIndex ? updatedTx : tx
          );
          // create new flow with updated tx list
          const updatedFlowList = currentUserTxFlows.map((flow) =>
            flow.id === flowId
              ? {
                  ...flow,
                  transactions: updatedTxList,
                }
              : flow
          );
          // set state
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(ethAccount, updatedFlowList)
            ),
          });
        },
        setTxFlowStatus: (ethAddress, flowId, status) => {
          // update single flow status
          const currentUserTxFlows = get().getUserTransactionFlows(ethAddress);
          const flowToUpdate = currentUserTxFlows.find(
            (flow) => flow.id === flowId
          );
          if (!flowToUpdate) {
            return;
          }
          const updatedFlow = { ...flowToUpdate, status };

          // put update flow back into list
          const updatedUserFlows = currentUserTxFlows.map((flow) =>
            flow.id === flowId ? updatedFlow : flow
          );
          // set new flows
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(ethAddress, updatedUserFlows)
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
          state?.setLoading(null);
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
