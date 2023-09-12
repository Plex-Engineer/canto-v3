import { ContractAbi } from "web3-types";
import { PromiseWithError, ReturnWithError } from "./errors";
import { BridgingMethod } from "@/hooks/bridge/interfaces/bridgeMethods";
import { TransactionFlowType } from "../transactions/txMap";

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
  transactions: TransactionWithStatus[];
  error?: string;
}

// user can be on different accounts to make transactions, so we need to map the transaction flows to the account
// index by account address
export type UserTransactionFlowMap = Map<string, TransactionFlow[]>;

///

export interface TransactionDescription {
  title: string;
  description: string;
}

export type Transaction = {
  // chainId the wallet must be on to perform the transaction
  chainId: number | string;
  description: TransactionDescription;
  bridge?: {
    type: BridgingMethod;
    lastStatus: TransactionStatus;
    timeLeft?: number;
  };
} & (
  | {
      type: "EVM";
      target: string;
      abi: ContractAbi;
      method: string;
      params: unknown[];
      value: string;
    }
  | {
      type: "COSMOS";
      msg: UnsignedCosmosMessages;
    }
  | {
      type: "KEPLR";
      tx: () => PromiseWithError<unknown>;
      getHash: (...args: any[]) => ReturnWithError<string>;
    }
);
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
  timestamp?: number;
}

export interface BridgeStatus {
  status: TransactionStatus;
  completedIn?: number;
}

///
/// Cosmos Transaction Interfaces
///
export interface CosmosTxContext {
  chain: Chain;
  sender: Sender;
  fee: Fee;
  memo: string;
  ethAddress: string;
}
export interface Fee {
  amount: string;
  denom: string;
  gas: string;
}
export interface Sender {
  accountAddress: string;
  sequence: number;
  accountNumber: number;
  pubkey: string | null | undefined;
}

export interface Chain {
  chainId: number;
  cosmosChainId: string;
}

///
/// For EIP-712
///
export interface EIP712FeeObject {
  amount: {
    amount: string;
    denom: string;
  }[];
  gas: string;
  feePayer: string;
}
export interface UnsignedCosmosMessages {
  eipMsg: EIP712Message | EIP712Message[];
  cosmosMsg: CosmosNativeMessage | CosmosNativeMessage[];
  // fee must be converted to correct type before sending
  fee: Fee;
  typesObject: object;
}
export interface EIP712Message {
  type: string;
  value: object;
}

export interface CosmosNativeMessage {
  message: object;
  path: string;
}
