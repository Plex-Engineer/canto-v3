import {
  NewTransactionFlow,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import { AmbientTransactionParams } from "./ambientPoolTxTypes";
import { AmbientPool } from "./ambientPools";
import { CLMClaimRewardsTxParams } from "@/hooks/lending/interfaces/lendingTxTypes";

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
    createNewPoolFlow: (
      params: AmbientTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
    createNewClaimRewardsFlow: (
      txParams: CLMClaimRewardsTxParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
