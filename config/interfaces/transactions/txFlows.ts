import { TransactionFlowType } from "@/config/transactions/txMap";
import { TransactionStatus, TransactionWithStatus } from ".";

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
///
export interface TransactionFlow extends NewTransactionFlow {
  id: string;
  status: TransactionStatus;
  createdAt: number;
  transactions: TransactionWithStatus[];
  error?: string;
}

// user can be on different accounts to make transactions, so we need to map the transaction flows to the account
// index by account address
export type UserTransactionFlowMap = Map<string, TransactionFlow[]>;
