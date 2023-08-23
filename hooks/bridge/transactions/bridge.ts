import {
  NEW_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BridgeTransactionParams } from "../interfaces/hookParams";
import { Transaction } from "@/config/interfaces/transactions";
import { BridgingMethod, IBCToken } from "../interfaces/tokens";
import { isCosmosNetwork, isEVMNetwork } from "@/utils/networks.utils";
import { bridgeInGravity } from "./methods/gravityBridge";
import { bridgeLayerZero } from "./methods/layerZero";
import { CosmosNetwork, EVMNetwork } from "@/config/interfaces/networks";
import { ibcInKeplr } from "./keplr/ibcKeplr";
import { txIBCOut } from "./methods/ibc";

/**
 * @notice creates a list of transactions that need to be made for bridging into canto
 * @param {BridgeTransactionParams} params parameters for bridging in
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeInTx(
  params: BridgeTransactionParams
): PromiseWithError<Transaction[]> {
  let transactions: ReturnWithError<Transaction[]>;
  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      // check to make sure EVM network is selected
      const gbridgeEVM = isEVMNetwork(params.from.network);
      if (!gbridgeEVM) {
        return NEW_ERROR(
          "bridgeInTx: gravity bridge only works for EVM networks"
        );
      }
      transactions = await bridgeInGravity(
        Number(params.from.network.chainId),
        params.from.account,
        params.to.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.LAYER_ZERO:
      const lzFromEVM = isEVMNetwork(params.from.network);
      const lzToEVM = isEVMNetwork(params.to.network);
      if (!(lzFromEVM && lzToEVM)) {
        return NEW_ERROR("bridgeInTx: layer zero only works for EVM networks");
      }
      transactions = await bridgeLayerZero(
        params.from.network as EVMNetwork,
        params.to.network as EVMNetwork,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      const ibcFromCosmos = isCosmosNetwork(params.from.network);
      if (!ibcFromCosmos) {
        return NEW_ERROR("bridgeInTx: IBC only works for Cosmos networks");
      }
      transactions = await ibcInKeplr(
        params.from.network as CosmosNetwork,
        params.from.account,
        params.to.account,
        params.token.data as IBCToken,
        params.token.amount
      );
      break;
    }
    default:
      return NEW_ERROR("bridgeInTx: invalid method: " + params.method);
  }
  if (transactions.error) {
    return NEW_ERROR("bridgeInTx::" + transactions.error);
  }
  return transactions;
}

/**
 * @notice creates a list of transactions that need to be made for bridging out of canto
 * @param {BridgeTransactionParams} params parameters for bridging out
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeOutTx(
  params: BridgeTransactionParams
): PromiseWithError<Transaction[]> {
  let transactions: ReturnWithError<Transaction[]>;
  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return NEW_ERROR("bridgeOutTx: GBRIDGE not implemented");
    case BridgingMethod.LAYER_ZERO:
      const lzFromEVM = isEVMNetwork(params.from.network);
      const lzToEVM = isEVMNetwork(params.to.network);
      if (!(lzFromEVM && lzToEVM)) {
        return NEW_ERROR("bridgeOutTx: layer zero only works for EVM networks");
      }
      transactions = await bridgeLayerZero(
        params.from.network as EVMNetwork,
        params.to.network as EVMNetwork,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      const toCosmos = isCosmosNetwork(params.to.network);
      if (!toCosmos) {
        return NEW_ERROR("bridgeOutTx: IBC only works for cosmos networks");
      }
      transactions = await txIBCOut(
        Number(params.from.network.chainId),
        params.from.account,
        params.to.account,
        params.to.network as CosmosNetwork,
        params.token.data as IBCToken,
        params.token.amount
      );
      break;
    }
    default:
      return NEW_ERROR("bridgeOutTx: invalid method: " + params.method);
  }
  if (transactions.error) {
    return NEW_ERROR("bridgeOutTx::" + transactions.error);
  }
  return transactions;
}
