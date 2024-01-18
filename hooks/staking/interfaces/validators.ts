type BondStatus =
  | "BOND_STATUS_UNSPECIFIED"
  | "BOND_STATUS_UNBONDED"
  | "BOND_STATUS_UNBONDING"
  | "BOND_STATUS_BONDED";
export interface Validator {
  operator_address: string;
  jailed: boolean;
  status: BondStatus;
  tokens: string;
  description: {
    moniker: string;
    identity?: string;
    website?: string;
    security_contact?: string;
    details?: string;
  };
  commission: string;
  rank: number;
}
export interface ValidatorWithDelegations extends Validator {
  userDelegation: {
    balance: string;
    rewards: string;
  };
}

export interface UnbondingDelegation {
  name: string;
  undelegation: string;
  completion_date: string;
}

export interface UserStakingReturn {
  delegations: DelegationResponse[];
  unbondingDelegations: UnbondingDelegationResponse[];
  rewards: DelegationRewardResponse;
}

/**
 * @notice Response type for querying user delegations
 */
interface DelegationResponse {
  balance: {
    denom: string;
    amount: string;
  };
  delegation: {
    delegator_address: string;
    shares: string;
    validator_address: string;
  };
}

/**
 * @notice Response type for querying user unbonding delegations
 */
interface UnbondingDelegationResponse {
  delegator_address: string;
  validator_address: string;
  entries: {
    creation_height: string;
    completion_time: string;
    initial_balance: string;
    balance: string;
  }[];
}

/**
 * @notice Response type for querying user rewards
 */
interface DelegationRewardResponse {
  rewards: {
    validator_address: string;
    reward: {
      denom: string;
      amount: string;
    }[];
  }[];
  total: {
    denom: string;
    amount: string;
  }[];
}
