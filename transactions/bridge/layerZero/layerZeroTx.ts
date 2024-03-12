import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import {
  NEW_ERROR,
  NO_ERROR,
  OFTToken,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import {
  BridgeStatus,
  TX_DESCRIPTIONS,
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { isValidEthAddress } from "@/utils/address";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { getNetworkInfoFromChainId, isCantoChainId } from "@/utils/networks";
import { getTokenBalance, isOFTToken } from "@/utils/tokens";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import { getMessagesBySrcTxHash } from "@layerzerolabs/scan-client";
import Web3 from "web3";
import {
  checkUseAdapterParams,
  createLzAdapterParams,
  estimateOFTSendGasFee,
} from "./helpers";
import { createApprovalTxs } from "@/transactions/erc20";
import { _oftTransferTx } from "./txCreators";
import { displayAmount } from "@/utils/formatting";
import { BridgingMethod, getBridgeMethodInfo } from "..";

type LayerZeroTxParams = {
  ethSender: string;
  fromNetworkChainId: number;
  toNetworkChainId: number;
  token: OFTToken;
  amount: string;
};

/**
 * @notice creates a list of transactions that need to be made for bridging through layer zero
 * @dev do not need an eth receiver, since it will always be the same as the sender
 * @param {LayerZeroTxParams} txParams LZ Tx parameters
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeLayerZeroTx(
  txParams: LayerZeroTxParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** get networks */
    const { data: fromNetwork, error: fromError } = getNetworkInfoFromChainId(
      txParams.fromNetworkChainId
    );
    if (fromError) throw fromError;
    const { data: toNetwork, error: toError } = getNetworkInfoFromChainId(
      txParams.toNetworkChainId
    );
    if (toError) throw toError;
    /** validate params */
    const validation = validateLayerZeroTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    /** create transaction list */
    const txList: Transaction[] = [];

    /** get LZ chain id for the toNetwork */
    const toLZChainId = LZ_CHAIN_IDS[toNetwork.id as keyof typeof LZ_CHAIN_IDS];
    if (!toLZChainId) throw new Error("invalid lz chainId: " + toNetwork.id);

    /** create address bytes */
    const toAddressBytes = new Web3().eth.abi.encodeParameter(
      "address",
      txParams.ethSender
    );

    /** create adapter params */
    let useAdapterParams = true;
    if (txParams.token.oftHasAdapterParams) {
      const { data: needsAdapterParams, error: adapterParamsError } =
        await checkUseAdapterParams(
          txParams.token.chainId,
          txParams.token.address
        );
      if (adapterParamsError) throw adapterParamsError;
      useAdapterParams = needsAdapterParams;
    }
    const adapterParams = useAdapterParams
      ? createLzAdapterParams(
          txParams.ethSender,
          isCantoChainId(txParams.toNetworkChainId)
        )
      : "0x";

    /** estimate gas */
    const { data: sendGasFee, error: gasError } = await estimateOFTSendGasFee(
      txParams.token.chainId,
      toLZChainId,
      txParams.token.address,
      txParams.ethSender,
      txParams.amount,
      adapterParams
    );
    if (gasError) throw gasError;

    let totalGas = sendGasFee;

    /** check if proxy OFT */
    if (txParams.token.isOFTProxy) {
      // check if non-native proxy
      if (txParams.token.oftUnderlyingAddress) {
        // check if proxy has allowance
        const { data: allowaneTxs, error: allowanceTxsError } =
          await createApprovalTxs(
            txParams.token.chainId,
            txParams.ethSender,
            [
              {
                address: txParams.token.oftUnderlyingAddress,
                symbol: txParams.token.symbol,
              },
            ],
            [txParams.amount],
            { address: txParams.token.address, name: "OFT Proxy" }
          );
        if (allowanceTxsError) throw allowanceTxsError;
        txList.push(...allowaneTxs);
      } else {
        // must be native OFT, (check if user has enough balance for wrapping)
        const { data: oftBalance, error: oftBalanceError } =
          await getTokenBalance(
            txParams.token.chainId,
            txParams.token.address,
            txParams.ethSender
          );
        if (oftBalanceError) throw oftBalanceError;
        // if OFT balance is less than amount, then user needs to deposit
        // Native OFT contract will handle the deposit (just send extra gas to cover deposit amount)
        if (oftBalance.lt(txParams.amount)) {
          totalGas = totalGas.plus(txParams.amount).minus(oftBalance);
        }
      }
    }

    /** push LZ tx */
    txList.push(
      _oftTransferTx(
        txParams.token.chainId,
        toLZChainId,
        txParams.ethSender,
        toAddressBytes,
        txParams.token.address,
        txParams.amount,
        totalGas.toString(),
        adapterParams,
        TX_DESCRIPTIONS.BRIDGE(
          txParams.token.symbol,
          displayAmount(txParams.amount, txParams.token.decimals),
          fromNetwork.name,
          toNetwork.name,
          getBridgeMethodInfo(BridgingMethod.LAYER_ZERO).name
        ),
        {
          direction: isCantoChainId(txParams.toNetworkChainId) ? "in" : "out",
          amountFormatted: displayAmount(
            txParams.amount,
            txParams.token.decimals,
            { symbol: txParams.token.symbol }
          ),
        }
      )
    );

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("bridgeLayerZeroTx" + err);
  }
}

export function validateLayerZeroTxParams(
  txParams: LayerZeroTxParams
): Validation {
  // check ethSender
  if (!isValidEthAddress(txParams.ethSender)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethSender"),
    };
  }
  // check token
  if (!isOFTToken(txParams.token)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("token"),
    };
  }
  // check amount
  return validateWeiUserInputTokenAmount(
    txParams.amount,
    "1",
    txParams.token.balance ?? "0",
    txParams.token.symbol,
    txParams.token.decimals
  );
}

/**
 * Will check status of ongoing LZ bridge
 */
export async function checkLZBridgeStatus(
  fromChainId: number,
  txHash: string
): PromiseWithError<BridgeStatus> {
  try {
    // get network
    const { data: fromNetwork, error: fromNetworkError } =
      getNetworkInfoFromChainId(fromChainId);
    if (fromNetworkError) throw new Error(fromNetworkError.message);

    const fromLZId = LZ_CHAIN_IDS[fromNetwork.id as keyof typeof LZ_CHAIN_IDS];
    if (!fromLZId) throw new Error("invalid lz chainId: " + fromNetwork.id);

    const { messages } = await getMessagesBySrcTxHash(fromLZId, txHash);
    if (messages.length === 0) return NO_ERROR({ status: "PENDING" });
    switch (messages[0].status) {
      case "INFLIGHT":
        return NO_ERROR({ status: "PENDING" });
      case "DELIVERED":
        return NO_ERROR({ status: "SUCCESS" });
      case "FAILED":
        return NO_ERROR({ status: "ERROR" });
      default:
        return NO_ERROR({ status: "NONE" });
    }
  } catch (err) {
    return NEW_ERROR("checkLZBridgeStatus", err);
  }
}
