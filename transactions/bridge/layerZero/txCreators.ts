/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

import { OFT_ABI } from "@/config/abis";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import {
  CantoFETxType,
  Transaction,
  TransactionDescription,
} from "@/transactions/interfaces";
import { BridgingMethod } from "..";

export const _oftTransferTx = (
  chainId: number,
  toLZChainId: number,
  ethAddress: string,
  toAddressBytes: string,
  tokenAddress: string,
  amount: string,
  gas: string,
  adapterParams: string,
  description: TransactionDescription,
  bridgeInfo: { direction: "in" | "out"; amountFormatted: string }
): Transaction => ({
  bridge: {
    lastStatus: "NONE",
    type: BridgingMethod.LAYER_ZERO,
    showInProgress: true,
    ...bridgeInfo,
  },
  feTxType: CantoFETxType.OFT_TRANSFER,
  description,
  fromAddress: ethAddress,
  chainId: chainId,
  type: "EVM",
  target: tokenAddress,
  abi: OFT_ABI,
  method: "sendFrom",
  params: [
    ethAddress,
    toLZChainId,
    toAddressBytes,
    amount,
    [ethAddress, ZERO_ADDRESS, adapterParams],
  ],
  value: gas,
});

export const _oftDepositOrWithdrawTx = (
  chainId: number,
  ethAccount: string,
  deposit: boolean,
  oftAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: deposit ? CantoFETxType.OFT_DEPOSIT : CantoFETxType.OFT_WITHDRAW,
  fromAddress: ethAccount,
  chainId: chainId,
  type: "EVM",
  target: oftAddress,
  abi: OFT_ABI,
  method: deposit ? "deposit" : "withdraw",
  params: deposit ? [] : [amount],
  value: deposit ? amount : "0",
});
