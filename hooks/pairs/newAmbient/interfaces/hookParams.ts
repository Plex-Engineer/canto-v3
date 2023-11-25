import {
  AmbientClaimRewardsTxParams,
  AmbientTransactionParams,
} from "@/transactions/pairs/ambient";
import { AmbientPool } from "./ambientPools";
import { Validation } from "@/config/interfaces";
import { NewTransactionFlow } from "@/transactions/flows";

export interface AmbientHookInputParams {
  chainId: number;
  userEthAddress?: string;
}
export interface AmbientHookReturn {
  isLoading: boolean;
  ambientPools: AmbientPool[];
  rewards: string;
  transaction: {
    validateParams: (txParams: AmbientTransactionParams) => Validation;
    newAmbientPoolTxFlow: (
      txParams: AmbientTransactionParams
    ) => NewTransactionFlow;
    newAmbientClaimRewardsFlow: (
      txParams: AmbientClaimRewardsTxParams
    ) => NewTransactionFlow;
  };
}
