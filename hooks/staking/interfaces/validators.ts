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
  rank: number
}
export interface ValidatorWithDelegations extends Validator {
  userDelegation: {
    balance: string;
    rewards: string;
  };
}

export interface UserUnbondingDelegation {
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
 * @notice Response type for querying user delegations
 */
export interface DelegationResponse {
  delegation_responses: {
    balance: {
      denom: string;
      amount: string;
    };
    delegation: {
      delegator_address: string;
      shares: string;
      validator_address: string;
    };
  }[];
  error: string | null;
}

/**
 * @notice Response type for querying user unbonding delegations
 */
export interface UnbondingDelegationResponse {
  unbonding_responses: {
    delegator_address: string;
    validator_address: string;
    entries: {
      creation_height: string;
      completion_time: string;
      initial_balance: string;
      balance: string;
    }[];
  }[];
  error: string | null;
}

/**
 * @notice Response type for querying user rewards
 */
export interface DelegationRewardResponse {
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
  error: string | null;
}
