import {
  ERC20Token,
  IBCToken,
  NEW_ERROR,
  OFTToken,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { BridgeTransactionParams, BridgingMethod } from ".";
import { BridgeStatus, TxCreatorFunctionReturn } from "../interfaces";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { isCantoChainId } from "@/utils/networks";
import {
  checkGbridgeTxStatus,
  gravityBridgeInTx,
  validateGravityBridgeInTxParams,
} from "./gravityBridge/gravityBridgeIn";
import {
  bridgeLayerZeroTx,
  checkLZBridgeStatus,
  validateLayerZeroTxParams,
} from "./layerZero/layerZeroTx";
import { IBCOutTx, validateIBCOutTxParams } from "./ibc/ibcOutTx";
import { ibcInKeplr, validateKeplrIBCParams } from "./ibc/ibcInTx";

/**
 * @notice creates a list of transactions that need to be made for bridging into canto
 * @param {BridgeTransactionParams} txParams parameters for bridging in
 * @returns {PromiseWithError<TxCreatorFunctionReturn>} list of transactions to make or error
 */
export async function cantoBridgeTx(
  txParams: BridgeTransactionParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // figure out which type of bridge to use from the method type
  switch (txParams.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return isCantoChainId(txParams.to.chainId as number)
        ? await gravityBridgeInTx({
            ethSender: txParams.from.account,
            token: txParams.token.data as ERC20Token,
            amount: txParams.token.amount,
          })
        : NEW_ERROR("cantoBridgeTx::Unknown bridging method");
    case BridgingMethod.LAYER_ZERO:
      return await bridgeLayerZeroTx({
        ethSender: txParams.from.account,
        fromNetworkChainId: txParams.from.chainId as number,
        toNetworkChainId: txParams.to.chainId as number,
        token: txParams.token.data as OFTToken,
        amount: txParams.token.amount,
      });
    case BridgingMethod.IBC:
      return isCantoChainId(txParams.to.chainId as number)
        ? await ibcInKeplr({
            senderCosmosAddress: txParams.from.account,
            cantoEthReceiverAddress: txParams.to.account,
            fromNetworkChainId: txParams.from.chainId as string,
            token: txParams.token.data as IBCToken,
            amount: txParams.token.amount,
          })
        : await IBCOutTx({
            senderEthAddress: txParams.from.account,
            receiverCosmosAddress: txParams.to.account,
            receivingChainId: txParams.to.chainId as string,
            token: txParams.token.data as IBCToken,
            amount: txParams.token.amount,
            convert: true,
          });
    default: {
      return NEW_ERROR(
        "cantoBridgeTx",
        TX_PARAM_ERRORS.PARAM_INVALID("method")
      );
    }
  }
}

export function validateCantoBridgeTxParams(
  txParams: BridgeTransactionParams
): Validation {
  // make sure token is present
  if (!txParams.token) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_MISSING("token"),
    };
  }
  // figure out which type of bridge to use from the method type
  switch (txParams.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return isCantoChainId(txParams.to.chainId as number)
        ? validateGravityBridgeInTxParams({
            ethSender: txParams.from.account,
            token: txParams.token.data as ERC20Token,
            amount: txParams.token.amount,
          })
        : { error: true, reason: "Invalid method" };
    case BridgingMethod.LAYER_ZERO:
      return validateLayerZeroTxParams({
        ethSender: txParams.from.account,
        fromNetworkChainId: txParams.from.chainId as number,
        toNetworkChainId: txParams.to.chainId as number,
        token: txParams.token.data as OFTToken,
        amount: txParams.token.amount,
      });
    case BridgingMethod.IBC:
      return isCantoChainId(txParams.to.chainId as number)
        ? validateKeplrIBCParams({
            senderCosmosAddress: txParams.from.account,
            cantoEthReceiverAddress: txParams.to.account,
            fromNetworkChainId: txParams.from.chainId as string,
            token: txParams.token.data as IBCToken,
            amount: txParams.token.amount,
          })
        : validateIBCOutTxParams({
            senderEthAddress: txParams.from.account,
            receiverCosmosAddress: txParams.to.account,
            receivingChainId: txParams.to.chainId as string,
            token: txParams.token.data as IBCToken,
            amount: txParams.token.amount,
            convert: true,
          });
    default: {
      return {
        error: true,
        reason: TX_PARAM_ERRORS.PARAM_INVALID("method"),
      };
    }
  }
}

export async function getBridgeStatus(
  type: BridgingMethod,
  chainId: number,
  txHash: string
): PromiseWithError<BridgeStatus> {
  switch (type) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return checkGbridgeTxStatus(chainId, txHash);
    case BridgingMethod.LAYER_ZERO:
      return checkLZBridgeStatus(chainId, txHash);
    default:
      return NEW_ERROR("getBridgeStatus::Unknown bridging method");
  }
}
