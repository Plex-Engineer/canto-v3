import {
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import {
  UnbondingDelegationResponse,
  UserUnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "./validators";
import { StakingTransactionParams } from "./stakingTxTypes";

export interface StakingHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface StakingHookReturn {
  validators: Validator[];
  apr: string;
  selection: {
    validator: ValidatorWithDelegations | null;
    setValidator: (address: string | null) => void;
  };
  transaction: {
    validateParams: (params: StakingTransactionParams) => ValidationReturn;
    createNewStakingFlow: (
      params: StakingTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
  userStaking?: {
    validators: ValidatorWithDelegations[];
    unbonding: UserUnbondingDelegation[];
    cantoBalance: string;
  };
}
