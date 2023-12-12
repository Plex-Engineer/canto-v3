import { Transaction, TransactionDescription } from "@/transactions/interfaces";
import { BridgingMethod } from "..";
import { GRAVITY_BRIDGE_ETH_ADDRESS } from "@/config/consts/addresses";
import { GRAVITY_BRIDGE_ABI, WETH_ABI } from "@/config/abis";

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
  description: TransactionDescription
): Transaction => ({
  bridge: {
    type: BridgingMethod.GRAVITY_BRIDGE,
    lastStatus: "NONE",
  },
  fromAddress: fromEthAddress,
  description,
  chainId: chainId,
  type: "EVM",
  target: GRAVITY_BRIDGE_ETH_ADDRESS,
  abi: GRAVITY_BRIDGE_ABI,
  method: "sendToCosmos",
  params: [tokenAddress, cantoReceiverAddress, amount],
  value: "0",
});

export const _wrapTx = (
  chainId: number,
  fromEthAddress: string,
  wethAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  fromAddress: fromEthAddress,
  type: "EVM",
  target: wethAddress,
  abi: WETH_ABI,
  method: "deposit",
  params: [],
  value: amount,
});
