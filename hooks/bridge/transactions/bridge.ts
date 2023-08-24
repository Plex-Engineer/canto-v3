import {
  NEW_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BridgeTransactionParams } from "../interfaces/hookParams";
import { Transaction } from "@/config/interfaces/transactions";
import { IBCToken, isIBCToken } from "../interfaces/tokens";
import { BridgingMethod } from "../interfaces/bridgeMethods";
import { isCosmosNetwork, isEVMNetwork } from "@/utils/networks.utils";
import { bridgeInGravity } from "./methods/gravityBridge";
import { bridgeLayerZero } from "./methods/layerZero";
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
  // create tx list
  let transactions: ReturnWithError<Transaction[]>;

  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      // check to make sure EVM network is selected
      if (!isEVMNetwork(params.from.network)) {
        return NEW_ERROR(
          "bridgeInTx: gravity bridge only works for EVM networks"
        );
      }
      transactions = await bridgeInGravity(
        params.from.network.chainId,
        params.from.account,
        params.to.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.LAYER_ZERO:
      if (
        !(isEVMNetwork(params.from.network) && isEVMNetwork(params.to.network))
      ) {
        return NEW_ERROR("bridgeInTx: layer zero only works for EVM networks");
      }
      transactions = await bridgeLayerZero(
        params.from.network,
        params.to.network,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      if (!isCosmosNetwork(params.from.network)) {
        return NEW_ERROR("bridgeInTx: IBC only works for Cosmos networks");
      }
      if (!isIBCToken(params.token.data)) {
        return NEW_ERROR("bridgeInTx: IBC only works for IBC tokens");
      }
      transactions = await ibcInKeplr(
        params.from.network,
        params.from.account,
        params.to.account,
        params.token.data,
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
  // create tx list
  let transactions: ReturnWithError<Transaction[]>;

  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return NEW_ERROR("bridgeOutTx: GBRIDGE not implemented");
    case BridgingMethod.LAYER_ZERO:
      if (
        !(isEVMNetwork(params.from.network) && isEVMNetwork(params.to.network))
      ) {
        return NEW_ERROR("bridgeOutTx: layer zero only works for EVM networks");
      }
      transactions = await bridgeLayerZero(
        params.from.network,
        params.to.network,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      if (
        !(
          isEVMNetwork(params.from.network) &&
          isCosmosNetwork(params.to.network)
        )
      ) {
        return NEW_ERROR(
          "bridgeOutTx: IBC only works from canto to cosmos networks"
        );
      }
      if (!isIBCToken(params.token.data)) {
        return NEW_ERROR("bridgeOutTx: IBC only works for IBC tokens");
      }
      transactions = await txIBCOut(
        params.from.network.chainId,
        params.from.account,
        params.to.account,
        params.to.network,
        params.token.data,
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
