import { TransactionFlowType } from "@/config/transactions/txMap";
import {
  TransactionDescription,
  TransactionStatus,
  TransactionWithStatus,
} from ".";

// how transactions are stored for the user (will allow retrying creating transactions)
// txType is the key for the txMap that will create the Transaction[] list
export interface NewTransactionFlow {
  title: string;
  icon: string;
  txType: TransactionFlowType;
  params: object;
}

///
/// Transaction Flows will include multiple transactions
/// Flow will have the title of the overal "transaction flow"
/// Flow will have a status
/// placeholder flows will only be called AFTER the first set of transactions are completed and successful
///
export interface TransactionFlow extends NewTransactionFlow {
  id: string;
  status: TransactionStatus;
  createdAt: number;
  transactions: TransactionWithStatus[];
  placeholderFlow?: NewTransactionFlowPlaceholder;
  error?: string;
}

// user can be on different accounts to make transactions, so we need to map the transaction flows to the account
// index by account address
export type UserTransactionFlowMap = Map<string, TransactionFlow[]>;

// some transaction flows will have another set of transactions that rely on returned data from the first set of transactions
// there must be a placeholder to store this tx, and the paramters that will be needed to create this second set of transactions
export interface NewTransactionFlowPlaceholder {
  description: TransactionDescription;
  txFlowType: TransactionFlowType;
  params: object;
}
