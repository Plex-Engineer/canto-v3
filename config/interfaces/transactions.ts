import { ContractAbi } from "web3-types";
// function classes would return calldata that would be saved as a string
export type Transaction = {
  chainId: number;
  description: string;
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
      // senderObj: Sender;
      // chain: Chain;
      // nodeAddress: string;
      // ethAccount: string;
    }
);
type TransactionStatus = "NONE" | "SIGNING" | "PENDING" | "SUCCESS" | "ERROR";

export interface TransactionWithStatus {
  tx: Transaction;
  status: TransactionStatus;
  hash?: string;
  error?: Error;
  txLink?: string;
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
  pubkey: string;
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
  eipMsg: EIP712Message;
  cosmosMsg: CosmosNativeMessage;
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
