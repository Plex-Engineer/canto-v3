import {
  Transaction,
  TransactionDescription,
  CantoFETxType,
} from "@/transactions/interfaces";
import { BridgingMethod } from "..";
import { GRAVITY_BRIDGE_ETH_ADDRESSES } from "@/config/consts/addresses";
import {
  GRAVITY_BRIDGE_ABI,
  SEND_ETH_TO_COSMOS_ABI,
  WETH_ABI,
} from "@/config/abis";
import { createMsgsSendToEth } from "@/transactions/cosmos/messages/gravitySendToEth/sendToEth";

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _sendToCosmosTx = (
  chainId: number,
  fromEthAddress: string,
  cantoReceiverAddress: string,
  tokenAddress: string,
  amount: string,
  description: TransactionDescription,
  bridgeInfo: { direction: "in" | "out"; amountFormatted: string }
): Transaction => ({
  bridge: {
    type: BridgingMethod.GRAVITY_BRIDGE,
    lastStatus: "NONE",
    showInProgress: true,
    ...bridgeInfo,
  },
  fromAddress: fromEthAddress,
  description,
  feTxType: CantoFETxType.SEND_TO_COSMOS,
  chainId: chainId,
  type: "EVM",
  target: GRAVITY_BRIDGE_ETH_ADDRESSES.gravityBridge,
  abi: GRAVITY_BRIDGE_ABI,
  method: "sendToCosmos",
  params: [tokenAddress, cantoReceiverAddress, amount],
  value: "0",
});

export const _sendEthToCosmosTx = (
  chainId: number,
  fromEthAddress: string,
  cantoReceiverAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  fromAddress: fromEthAddress,
  description,
  feTxType: CantoFETxType.SEND_ETH_TO_COSMOS,
  chainId: chainId,
  type: "EVM",
  target: GRAVITY_BRIDGE_ETH_ADDRESSES.sendEth,
  abi: SEND_ETH_TO_COSMOS_ABI,
  method: "sendToCosmos",
  params: [cantoReceiverAddress],
  value: amount,
});

export const _wrapTx = (
  chainId: number,
  fromEthAddress: string,
  wethAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  feTxType: CantoFETxType.WRAP_ETH,
  chainId: chainId,
  fromAddress: fromEthAddress,
  type: "EVM",
  target: wethAddress,
  abi: WETH_ABI,
  method: "deposit",
  params: [],
  value: amount,
});

export const _sendToEthGravityTx = (
  chainId: number,
  gravitySender: string,
  ethReceiver: string,
  nativeName: string,
  amount: string,
  bridgeFee: string,
  chainFee: string,
  description: TransactionDescription,
  bridgeInfo: { direction: "in" | "out"; amountFormatted: string }
): Transaction => ({
  description,
  feTxType: CantoFETxType.SEND_TO_ETH,
  bridge: {
    type: BridgingMethod.GRAVITY_BRIDGE,
    lastStatus: "NONE",
    showInProgress: true,
    ...bridgeInfo,
  },
  fromAddress: ethReceiver,
  chainId: chainId,
  type: "COSMOS",
  msg: createMsgsSendToEth({
    amount,
    bridgeFee,
    chainFee,
    ethReceiver,
    gravitySender,
    nativeName,
  }),
});
