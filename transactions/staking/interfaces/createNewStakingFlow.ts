import { NO_ERROR, ReturnWithError } from "@/config/interfaces";
import { StakingTransactionParams } from "./stakingTxTypes";
import { TransactionFlowType } from "@/transactions/flows/flowMap";
import { NewTransactionFlow } from "@/transactions/flows/types";

export function createNewStakingTxFlow(
  params: StakingTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType,
    icon: "/tokens/canto.svg",
    txType: TransactionFlowType.STAKE_CANTO_TX,
    params: params,
  });
}
