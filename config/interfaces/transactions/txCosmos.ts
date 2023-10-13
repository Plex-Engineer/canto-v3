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
