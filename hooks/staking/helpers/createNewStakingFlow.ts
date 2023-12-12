import {
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
} from "@/config/interfaces";
import { StakingTransactionParams } from "../interfaces/stakingTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";

export function createNewStakingTxFlow(
  params: StakingTransactionParams
): ReturnWithError<NewTransactionFlow> {
  return NO_ERROR({
    title: params.txType,
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.svg",
    txType: TransactionFlowType.STAKE_CANTO_TX,
    params: params,
  });
}
