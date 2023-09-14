import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import {
  BridgeStatus,
  NewTransactionFlow,
  TransactionFlow,
  TransactionStatus,
  TransactionWithStatus,
  UserTransactionFlowMap,
} from "@/config/interfaces/transactions";
import { TRANSACTION_FLOW_MAP } from "@/config/transactions/txMap";
import {
  performSingleTransaction,
  waitForTransaction,
} from "@/utils/baseTransaction.utils";
import { getNetworkInfoFromChainId } from "@/utils/networks.utils";
import { GetWalletClientResult } from "wagmi/actions";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

interface AddNewFlowParams {
  txFlow: NewTransactionFlow;
  signer: GetWalletClientResult | undefined;
}
export interface TransactionStore {
  transactionFlows: UserTransactionFlowMap;
  getUserTransactionFlows: (ethAccount: string) => TransactionFlow[];
  addNewFlow: (params: AddNewFlowParams) => PromiseWithError<boolean>;
  // will delete the flow with the id provided, or the entire store if no index provided
  clearTransactions: (ethAccount: string, flowId?: string) => void;
  performFlow: (
    signer: GetWalletClientResult | undefined,
    flowId?: string
  ) => PromiseWithError<boolean>;
  // this should only be called internally
  setTxStatus: (
    ethAccount: string,
    flowId: string,
    txIndex: number,
    details: Partial<TransactionWithStatus>
  ) => void;
  updateTxFlow: (
    ethAccount: string,
    flowId: string,
    params: Partial<TransactionFlow>
  ) => void;
  // special function for setting bridge status on a transaction
  setTxBridgeStatus: (
    ethAccount: string,
    flowId: string,
    txIndex: number,
    status: BridgeStatus
  ) => void;
}

const useTransactionStore = create<TransactionStore>()(
  devtools(
    persist(
      (set, get) => ({
        transactionFlows: new Map<string, TransactionFlow[]>(),
        getUserTransactionFlows: (ethAccount) => {
          const userTxFlows = get().transactionFlows.get(ethAccount);
          return userTxFlows || [];
        },
        addNewFlow: async (params) => {
          // make sure signer is here
          if (!params.signer) {
            return NEW_ERROR(
              "useTransactionStore::addNewFlow: no signer provided"
            );
          }
          // create new flow before getting transactions
          // set the transactions to an empty array for now, since we will get them when actually performing the flow
          let newFlow: TransactionFlow = {
            ...params.txFlow,
            id: Date.now().toString(),
            createdAt: new Date().getTime(),
            status: "POPULATING",
            transactions: [],
          };
          // add the flow to the user map and set loading to null
          const currentUserTransactionFlows = get().getUserTransactionFlows(
            params.signer.account.address
          );
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(params.signer.account.address, [
                ...currentUserTransactionFlows,
                newFlow,
              ])
            ),
          });
          // we are expecting a signer so call performTransactions
          return await get().performFlow(params.signer);
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
        performFlow: async (signer, flowId) => {
          // make sure signer is here
          if (!signer) {
            return NEW_ERROR(
              "useTransactionStore::performFlow: no signer provided"
            );
          }
          const ethAddress = signer.account.address;
          // grab user flows
          const userTxFlows = get().getUserTransactionFlows(ethAddress);
          if (userTxFlows.length === 0) {
            return NEW_ERROR(
              "useTransactionStore::performFlow: no flows found"
            );
          }
          // start with the most recent if none provided
          const flowToPerform = flowId
            ? userTxFlows.find((flow) => flow.id === flowId)
            : userTxFlows[userTxFlows.length - 1];
          // check that we have a transaction flow object
          if (!flowToPerform) {
            return NEW_ERROR("useTransactionStore::performFlow: no flow found");
          }
          // set the flow status to populating since we are about to populate it with transactions
          get().updateTxFlow(ethAddress, flowToPerform.id, {
            status: "POPULATING",
          });

          // create the new transactions to complete the flow
          // we don't need to validate the params since they are validated when creating the transaction list anyways
          const { data: newTransactions, error: newTransactionListError } =
            await TRANSACTION_FLOW_MAP[flowToPerform.txType].tx(
              flowToPerform.params
            );
          if (newTransactionListError) {
            // something failed, so set the flow to failure
            const errorMsgString =
              "useTransactionStore::performFlow: " +
              errMsg(newTransactionListError);
            get().updateTxFlow(ethAddress, flowToPerform.id, {
              status: "ERROR",
              error: errorMsgString,
            });
            return NEW_ERROR(errorMsgString);
          }

          // keep all successful transactions in the flow
          const successfulTransactions = flowToPerform.transactions.filter(
            (tx) => tx.status === "SUCCESS"
          );

          // create updated list
          const updatedTransactionList = [
            ...successfulTransactions,
            ...newTransactions.map((tx) => ({
              tx,
              status: "NONE" as TransactionStatus,
            })),
          ];

          // set the transactions to the new list and set status to signing since we are about to sign them
          get().updateTxFlow(ethAddress, flowToPerform.id, {
            transactions: updatedTransactionList,
            status: "SIGNING",
            error: undefined,
          });

          // start at the first transaction that hasn't been completed
          const txIndex = successfulTransactions.length;

          // go through each transaction and perform it
          for (let i = txIndex; i < updatedTransactionList.length; i++) {
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
                await performSingleTransaction(
                  updatedTransactionList[i].tx,
                  signer
                );
              // if error with signature, set status and throw error
              if (txError) {
                throw txError;
              }

              // we have a txHash so we can set status to pending
              // to get the txLink, we can grab it from the chainId,
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "PENDING",
                hash: txHash,
                txLink: getNetworkInfoFromChainId(
                  updatedTransactionList[i].tx.chainId
                ).data.blockExplorer?.getTransactionLink(txHash),
                timestamp: new Date().getTime(),
              });
              // wait for the result before moving on
              const { data: receipt, error: txReceiptError } =
                await waitForTransaction(
                  updatedTransactionList[i].tx.type,
                  updatedTransactionList[i].tx.chainId,
                  txHash
                );
              // check receipt for error
              if (txReceiptError || receipt.status !== "success") {
                throw Error(receipt.error);
              }
              // transaction was a success so we can set status and
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "SUCCESS",
              });
            } catch (err) {
              // something failed, so set the flow and tx to failure
              get().setTxStatus(ethAddress, flowToPerform.id, i, {
                status: "ERROR",
                error: "useTransactionStore::performFlow:" + errMsg(err),
                timestamp: new Date().getTime(),
              });
              get().updateTxFlow(ethAddress, flowToPerform.id, {
                status: "ERROR",
              });
              return NEW_ERROR(
                "useTransactionStore::performTransactions: " + errMsg(err)
              );
            }
          }
          // made it through the whole list, so the flow was a success
          get().updateTxFlow(ethAddress, flowToPerform.id, {
            status: "SUCCESS",
          });
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
        updateTxFlow: (ethAccount, flowId, params) => {
          // update single flow
          const currentUserTxFlows = get().getUserTransactionFlows(ethAccount);
          const flowToUpdate = currentUserTxFlows.find(
            (flow) => flow.id === flowId
          );
          if (!flowToUpdate) {
            return;
          }
          const updatedFlow = { ...flowToUpdate, ...params };

          // put update flow back into list
          const updatedUserFlows = currentUserTxFlows.map((flow) =>
            flow.id === flowId ? updatedFlow : flow
          );
          // set new flows
          set({
            transactionFlows: new Map(
              get().transactionFlows.set(ethAccount, updatedUserFlows)
            ),
          });
        },
        setTxBridgeStatus: (ethAccount, flowId, txIndex, status) => {
          // find the flow we need to update the tx in
          const currentUserTxFlows = get().getUserTransactionFlows(ethAccount);
          const flowToUpdate = currentUserTxFlows.find(
            (flow) => flow.id === flowId
          );
          if (!flowToUpdate) {
            return;
          }
          // create new tx with details
          const txToUpdate = flowToUpdate.transactions[txIndex];

          //make sure this is actually a bridge
          if (!txToUpdate.tx.bridge) {
            return;
          }
          const updatedTx = {
            ...txToUpdate,
            tx: {
              ...txToUpdate.tx,
              bridge: {
                ...txToUpdate.tx.bridge,
                lastStatus: status.status,
                timeLeft: status.completedIn,
              },
            },
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
          // reset pending transactions to error
          state?.transactionFlows.forEach((userFlowList, userAddress) => {
            userFlowList.forEach((txFlow) => {
              if (
                txFlow.status === "SIGNING" ||
                txFlow.status === "POPULATING"
              ) {
                state.updateTxFlow(userAddress, txFlow.id, {
                  status: "ERROR",
                });
              }
            });
          });
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
