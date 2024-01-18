import { ReturnWithError, Validation } from "@/config/interfaces";
import {
  UnbondingDelegation,
  UserUnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "./validators";
import { StakingTransactionParams } from "../../../transactions/staking/interfaces/stakingTxTypes";
import { NewTransactionFlow } from "@/transactions/flows/types";

export interface StakingHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface StakingHookReturn {
  isLoading: boolean;
  validators: Validator[];
  apr: string;
  selection: {
    validator: ValidatorWithDelegations | null;
    setValidator: (address: string | null) => void;
  };
  transaction: {
    validateStakingTxParams: (
      params: StakingTransactionParams
    ) => ReturnWithError<Validation>;
    createNewStakingFlow: (
      params: StakingTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
  userStaking: {
    validators: ValidatorWithDelegations[];
    unbonding: UnbondingDelegation[];
    cantoBalance: string;
  };
}
