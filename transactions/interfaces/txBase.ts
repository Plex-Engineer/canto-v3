import { ContractAbi } from "web3-types";
import { CantoFETxType, TransactionStatus, UnsignedCosmosMessages } from ".";
import { PromiseWithError, ReturnWithError } from "@/config/interfaces/errors";
import { NewTransactionFlowPlaceholder } from "../flows";
import { BridgingMethod } from "../bridge";

export interface TransactionDescription {
  title: string;
  description: string;
}

export type Transaction = {
  // chainId the wallet must be on to perform the transaction
  chainId: number | string;
  description: TransactionDescription;
  feTxType: CantoFETxType;
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

// interface to use for functions that return transactions ready for the txStore
export interface TxCreatorFunctionReturn {
  transactions: Transaction[];
  extraFlow?: NewTransactionFlowPlaceholder;
}
