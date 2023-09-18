import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  errMsg,
  NewTransactionFlow,
  BaseNetwork,
} from "@/config/interfaces";
import { BridgeTransactionParams } from "../interfaces/hookParams";
import { BridgeToken } from "../interfaces/tokens";
import { BridgingMethod } from "../interfaces/bridgeMethods";
import { formatBalance } from "@/utils/tokenBalances.utils";
import { TransactionFlowType } from "@/config/transactions/txMap";

interface CreateBridgeFlowParams extends CreateBridgeTxParams {
  bridgeIn: boolean;
}
/**
 * @notice Returns the new transaction flow for the bridge
 * @param {CreateBridgeFlowParams} params the params to create the bridge transaction flow
 * @returns {ReturnWithError<NewTransactionFlow>} the new transaction flow or error if missing params
 */
export function createNewBridgeFlow(
  params: CreateBridgeFlowParams
): ReturnWithError<NewTransactionFlow> {
  // try to create valid bridge params
  const { data: bridgeParams, error: bridgeParamsError } =
    getBridgeTransactionParams(params);
  if (bridgeParamsError) {
    return NEW_ERROR("createNewBridgeFlow::" + errMsg(bridgeParamsError));
  }
  return NO_ERROR({
    title: `Bridge ${params.bridgeIn ? "In" : "Out"} ${formatBalance(
      bridgeParams.token.amount,
      bridgeParams.token.data.decimals
    )} ${bridgeParams.token.data.symbol}`,
    icon: bridgeParams.token.data.icon,
    txType: params.bridgeIn
      ? TransactionFlowType.BRIDGE_IN
      : TransactionFlowType.BRIDGE_OUT,
    params: bridgeParams,
  });
}

interface CreateBridgeTxParams {
  token: BridgeToken | null;
  fromNetwork: BaseNetwork | null;
  toNetwork: BaseNetwork | null;
  method: BridgingMethod | null;
  sender: string | null;
  receiver: string | null;
  amount: string | null;
}
/**
 * @notice Returns the bridge transaction params
 * @param {CreateBridgeTxParams} params the params to create the bridge transaction params
 * @returns {ReturnWithError<BridgeTransactionParams>} the bridge transaction params or error if missing params
 */
function getBridgeTransactionParams(
  params: CreateBridgeTxParams
): ReturnWithError<BridgeTransactionParams> {
  // check that all params exits
  if (
    !params.token ||
    !params.fromNetwork ||
    !params.toNetwork ||
    !params.method ||
    !params.sender ||
    !params.receiver ||
    !params.amount
  ) {
    return NEW_ERROR(
      "checkBridgeTxParams: missing params" + JSON.stringify(params)
    );
  }
  return NO_ERROR({
    from: {
      chainId: params.fromNetwork.chainId,
      account: params.sender,
    },
    to: {
      chainId: params.toNetwork.chainId,
      account: params.receiver,
    },
    token: {
      data: params.token,
      amount: params.amount,
    },
    method: params.method,
  });
}
