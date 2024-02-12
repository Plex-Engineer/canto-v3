import { Transaction } from ".";

export type TransactionStatus =
  | "NONE"
  | "POPULATING"
  | "SIGNING"
  | "PENDING"
  | "SUCCESS"
  | "ERROR";

export interface TransactionWithStatus {
  tx: Transaction;
  status: TransactionStatus;
  hash?: string;
  error?: string;
  txLink?: string;
  startTimestamp?: number;
  timestamp?: number;
}

export interface BridgeStatus {
  status: TransactionStatus;
  completedIn?: number;
}
