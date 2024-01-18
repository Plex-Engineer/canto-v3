import { NewTransactionFlow, TransactionFlowType } from "../flows";
import { StakingTransactionParams } from "./types";

export const newStakingFlow = (
  txParams: StakingTransactionParams
): NewTransactionFlow => ({
  title: txParams.txType,
  icon: "/tokens/canto.svg",
  txType: TransactionFlowType.STAKE_CANTO_TX,
  params: txParams,
});
