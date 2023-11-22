import { createMsgsConvertCoin } from "@/transactions/cosmos/messages/convertCoin/convertCoin";
import { createMsgsConvertERC20 } from "@/transactions/cosmos/messages/convertCoin/convertERC20";
import { createMsgsIBCTransfer } from "@/transactions/cosmos/messages/ibc/ibc";
import { Transaction, TransactionDescription } from "@/transactions/interfaces";

export const _ibcOutTx = (
  chainId: number,
  sourcePort: string,
  sourceChannel: string,
  amount: string,
  denom: string,
  cosmosReceiver: string,
  cantoSender: string,
  revisionNumber: number,
  revisionHeight: number,
  timeoutTimestamp: string,
  memo: string,
  description: TransactionDescription
): Transaction => {
  const ibcTx = createMsgsIBCTransfer({
    sourcePort,
    sourceChannel,
    amount,
    denom,
    cosmosReceiver,
    cosmosSender: cantoSender,
    revisionNumber,
    revisionHeight,
    timeoutTimestamp,
    memo,
  });
  return {
    chainId,
    type: "COSMOS",
    description,
    msg: ibcTx,
  };
};

export const _convertERC20Tx = (
  chainId: number,
  tokenAddress: string,
  amount: string,
  ethSender: string,
  cantoReceiver: string,
  description: TransactionDescription
): Transaction => {
  const convertERC20Tx = createMsgsConvertERC20({
    contract_address: tokenAddress,
    amount,
    cantoReceiver: cantoReceiver,
    ethSender: ethSender,
  });
  return {
    chainId,
    description,
    type: "COSMOS",
    msg: convertERC20Tx,
  };
};

export const _convertCoinTx = (
  chainId: number,
  cantoSender: string,
  ethReceiver: string,
  tokenDenom: string,
  amount: string,
  description: TransactionDescription
): Transaction => {
  const convertCoinTx = createMsgsConvertCoin({
    cantoSender,
    ethReceiver,
    amount,
    denom: tokenDenom,
  });
  return {
    chainId,
    description,
    type: "COSMOS",
    msg: convertCoinTx,
  };
};
