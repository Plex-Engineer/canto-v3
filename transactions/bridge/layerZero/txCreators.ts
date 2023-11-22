/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

import { OFT_ABI } from "@/config/abis";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { Transaction, TransactionDescription } from "@/transactions/interfaces";
import { BridgingMethod } from "..";

// if useCustomAdapterParams is true, we must pass in adapter params
const DEFAULT_ADAPTER_PARAMS =
  "0x00010000000000000000000000000000000000000000000000000000000000030d40";
export const _oftTransferTx = (
  chainId: number,
  toLZChainId: number,
  ethAddress: string,
  toAddressBytes: string,
  tokenAddress: string,
  amount: string,
  gas: string,
  needAdapterParams: boolean,
  description: TransactionDescription
): Transaction => ({
  bridge: {
    lastStatus: "NONE",
    type: BridgingMethod.LAYER_ZERO,
  },
  description,
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
    [
      ethAddress,
      ZERO_ADDRESS,
      needAdapterParams ? DEFAULT_ADAPTER_PARAMS : "0x",
    ],
  ],
  value: gas,
});

export const _oftDepositOrWithdrawTx = (
  chainId: number,
  deposit: boolean,
  oftAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: oftAddress,
  abi: OFT_ABI,
  method: deposit ? "deposit" : "withdraw",
  params: deposit ? [] : [amount],
  value: deposit ? amount : "0",
});
