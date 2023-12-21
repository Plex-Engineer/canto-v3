import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import {
  IBCToken,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import {
  BridgeStatus,
  TX_DESCRIPTIONS,
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import { areEqualAddresses, isValidEthAddress } from "@/utils/address";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { isIBCToken } from "@/utils/tokens";
import { ethToGravity } from "@gravity-bridge/address-converter";
import { IBCOutTx } from "../ibc/ibcOutTx";
import {
  ETH_MAINNET,
  GRAVITY_BRIDGE,
  GRAVITY_BRIGDE_EVM,
} from "@/config/networks";
import { getCosmosTokenBalance } from "@/utils/cosmos";
import BRIDGE_IN_TOKEN_LIST from "@/config/jsons/bridgeInTokens.json";
import BigNumber from "bignumber.js";
import { _sendToEthGravityTx } from "./txCreators";
import { BridgingMethod, getBridgeMethodInfo } from "..";
import { displayAmount } from "@/utils/formatting";
import { getCosmosTxDetailsFromHash } from "@/transactions/signTx/cosmosEIP/signCosmosEIP";
import { tryFetch } from "@/utils/async";

type GravityBridgeOutParams = {
  ethSender: string;
  token: IBCToken;
  amount: string;
  chainFee: string;
  bridgeFee: string;
};
export async function gravityBridgeOutTx(
  txParams: GravityBridgeOutParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** validate params */
    const validation = validateGravityBridgeOutTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    /** convert eth address to gravity */
    const gravityAddress = ethToGravity(txParams.ethSender);

    /** get total amount */
    const totalAmount = new BigNumber(txParams.amount)
      .plus(txParams.chainFee)
      .plus(txParams.bridgeFee);

    /** create tx list */
    const txList: Transaction[] = [];

    /**
     * token denom will be different on gravity bridge chain
     * check the brigde in token list from gravity to find matching ibc denom
     */
    const gravTokenList =
      BRIDGE_IN_TOKEN_LIST.chainTokenList[
        GRAVITY_BRIDGE.chainId as keyof typeof BRIDGE_IN_TOKEN_LIST.chainTokenList
      ];
    if (!gravTokenList || !Array.isArray(gravTokenList))
      throw new Error("no gravity eth tokens");

    const gravEthToken = (gravTokenList as any[]).find((token) =>
      areEqualAddresses(token.ibcDenom, txParams.token.ibcDenom)
    );
    /** check balance for token on gravity-bridge */
    const { data: gravTokenBalance, error: gravBalanceError } =
      await getCosmosTokenBalance(
        GRAVITY_BRIDGE.chainId,
        gravityAddress,
        gravEthToken.nativeName
      );
    if (gravBalanceError) throw gravBalanceError;

    /** check if user needs to ibc out to gravity bridge */
    const amountToIBC = totalAmount.minus(gravTokenBalance);
    if (amountToIBC.isGreaterThan(0)) {
      /** add IBCOut txs to list */
      const { data: ibcTxs, error: ibcTxsError } = await IBCOutTx({
        senderEthAddress: txParams.ethSender,
        receiverCosmosAddress: gravityAddress,
        receivingChainId: GRAVITY_BRIDGE.chainId,
        token: txParams.token,
        amount: amountToIBC.toString(),
        convert: true,
        verifyComplete: true,
      });
      if (ibcTxsError) throw ibcTxsError;
      txList.push(...ibcTxs.transactions);
    }

    /** send to eth from gravity */
    txList.push(
      _sendToEthGravityTx(
        GRAVITY_BRIGDE_EVM.chainId,
        gravityAddress,
        txParams.ethSender,
        gravEthToken.nativeName,
        txParams.amount,
        txParams.bridgeFee,
        txParams.chainFee,
        TX_DESCRIPTIONS.BRIDGE(
          txParams.token.symbol,
          displayAmount(txParams.amount, txParams.token.decimals),
          GRAVITY_BRIDGE.name,
          ETH_MAINNET.name,
          getBridgeMethodInfo(BridgingMethod.GRAVITY_BRIDGE).name
        )
      )
    );

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("gravityBridgeOutTx", err);
  }
}

export function validateGravityBridgeOutTxParams(
  txParams: GravityBridgeOutParams
): Validation {
  // check if eth address is valid
  if (!isValidEthAddress(txParams.ethSender)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethSender"),
    };
  }
  // check if token is valid
  if (!isIBCToken(txParams.token)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("token"),
    };
  }
  // check chain fee
  if (txParams.chainFee === "0") {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("chain fee"),
    };
  }
  const totalAmount = new BigNumber(txParams.amount)
    .plus(txParams.chainFee)
    .plus(txParams.bridgeFee);
  // check if amount is valid
  return validateWeiUserInputTokenAmount(
    totalAmount.toString(),
    "1",
    txParams.token.balance ?? "0",
    txParams.token.symbol,
    txParams.token.decimals
  );
}

/**
 * Will check to see if gbridge has completed the transaction
 */
export async function checkGbridgeOutTxStatus(
  txHash: string
): PromiseWithError<BridgeStatus> {
  try {
    // get tx data from gravity bridge
    const { data: txData, error } = await getCosmosTxDetailsFromHash(
      GRAVITY_BRIDGE.chainId,
      txHash
    );
    if (error) throw error;

    // check if tx is complete
    if (txData.tx_response.code !== 0) throw new Error("tx failed");

    // get events from txData to get the txId
    const allEvents = txData.tx_response.logs.flatMap((log) => log.events);

    // get txId event
    const txIdEvent = allEvents.find(
      (event) => event.type === "gravity.v1.EventOutgoingTxId"
    );
    if (!txIdEvent) throw new Error("txId event not found");

    // get txId from event (remove quotes from value)
    const txId = txIdEvent.attributes
      .find((att) => att.key === "tx_id")
      ?.value?.replace(/["]+/g, "");
    if (!txId) throw new Error("txId not found");

    // get current pending sendToEthEvents
    const { data: pendingSendToEth, error: pendingSendToEthError } =
      await tryFetch<PendingSendToEthResponse>(
        `${GRAVITY_BRIDGE.restEndpoint}/gravity/v1beta/query_pending_send_to_eth`
      );
    if (pendingSendToEthError) throw pendingSendToEthError;

    // find tx with same id
    const tx = [
      ...pendingSendToEth.transfers_in_batches,
      ...pendingSendToEth.unbatched_transfers,
    ].find((batchTx) => {
      return batchTx.id === txId;
    });

    // if tx is not found, it has been completed
    if (!tx) {
      return NO_ERROR({ status: "SUCCESS" });
    }
    return NO_ERROR({ status: "PENDING" });
  } catch (err) {
    return NEW_ERROR("checkGbridgeOutTxStatus" + err);
  }
}
type PendingSendToEthResponse = {
  transfers_in_batches: SendToEthTrasnfer[];
  unbatched_transfers: SendToEthTrasnfer[];
};
type SendToEthTrasnfer = {
  id: string;
  sender: string;
  dest_address: string;
  erc20_token: {
    contract: string;
    amount: string;
  };
  erc20_fee: {
    contract: string;
    amount: string;
  };
};
