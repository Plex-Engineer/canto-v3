import { Validation } from "@/config/interfaces";
import {
  UnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "./validators";
import { StakingTransactionParams } from "@/transactions/staking";
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
    validateTxParams: (params: StakingTransactionParams) => Validation;
    newStakingFlow: (params: StakingTransactionParams) => NewTransactionFlow;
  };
  userStaking: {
    validators: ValidatorWithDelegations[];
    unbonding: UnbondingDelegation[];
    cantoBalance: string;
  };
}
