import { NO_ERROR, PromiseWithError } from "@/config/interfaces";
import {
  UserGBridgeInHistory,
  getUserGBridgeInHistory,
} from "./gbridgeHistory";
import { UserIBCTransactionHistory, getAllIBCTransactions } from "./ibcHistory";
import {
  UserLayerZeroHistory,
  getUserLayerZeroHistory,
} from "./layerZeroHistory";
import { CANTO_MAINNET_EVM, ETH_MAINNET } from "@/config/networks";

interface AllUserBridgeTransactionHistory {
  layerZero: UserLayerZeroHistory;
  gravityBridge: UserGBridgeInHistory;
  ibc: UserIBCTransactionHistory;
}

async function getAllUserBridgeTransactionHistory(
  ethAccount: string
): PromiseWithError<AllUserBridgeTransactionHistory> {
  const [layerZero, gravityBridge, ibc] = await Promise.all([
    getUserLayerZeroHistory(
      CANTO_MAINNET_EVM.chainId,
      "0x56C03B8C4FA80Ba37F5A7b60CAAAEF749bB5b220",
      ethAccount
    ),
    getUserGBridgeInHistory(ETH_MAINNET.chainId, ethAccount),
    getAllIBCTransactions(CANTO_MAINNET_EVM.chainId, ethAccount),
  ]);
  return NO_ERROR({
    layerZero: layerZero.data,
    gravityBridge: gravityBridge.data,
    ibc: ibc.data,
  });
}
