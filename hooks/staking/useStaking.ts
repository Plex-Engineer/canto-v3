import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import {
  Validator,
  ValidatorWithDelegations,
} from "./interfaces/validators";
import { useQuery } from "react-query";
import {
  StakingHookInputParams,
  StakingHookReturn,
} from "./interfaces/hookParams";
import { getAllUserStakingData } from "./helpers/userStaking";
import { useState } from "react";
import {
  StakingTransactionParams,
  StakingTxTypes,
} from "./interfaces/stakingTxTypes";
import {
  NEW_ERROR,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";

import { useBalance } from "wagmi";

import { createNewStakingTxFlow } from "./helpers/createNewStakingFlow";
import { areEqualAddresses } from "@/utils/address";
import { validateNonWeiUserInputTokenAmount } from "@/utils/math";
import { NewTransactionFlow } from "@/transactions/flows/types";

export default function useStaking(
  params: StakingHookInputParams,
  options?: { refetchInterval?: number }
): StakingHookReturn {
  ///
  /// INTERNAL HOOKS
  ///

  // query staking data
  const { data: staking, isLoading } = useQuery(
    ["staking", params.chainId, params.userEthAddress],
    async () => {
      const [allValidators, stakingApr, userStaking] = await Promise.all([
        getCantoApiData<Validator[]>(
          params.chainId,
          CANTO_DATA_API_ENDPOINTS.allValidators
        ),
        getCantoApiData<string>(
          params.chainId,
          CANTO_DATA_API_ENDPOINTS.stakingApr
        ),
        getAllUserStakingData(params.chainId, params.userEthAddress ?? ""),
      ]);

      // combine user delegation data with validator data
      const userValidators: ValidatorWithDelegations[] = [];
      if (userStaking.data && allValidators.data) {
        userStaking.data.delegations.delegation_responses.forEach(
          (delegation) => {
            const validator = allValidators.data.find(
              (validator) =>
                validator.operator_address ===
                delegation.delegation.validator_address
            );
            const rewards =
              userStaking.data.rewards.rewards
                .find(
                  (rew) =>
                    rew.validator_address ===
                    delegation.delegation.validator_address
                )
                ?.reward.find((balance) => balance.denom === "acanto")
                ?.amount ?? "0";
            if (validator) {
              userValidators.push({
                ...validator,
                userDelegation: {
                  balance: delegation.balance.amount,
                  rewards: rewards,
                },
              });
            }
          }
        );
      }
      return {
        validators: allValidators.data,
        apr: stakingApr.data,
        userStaking: {
          validators: userValidators,
          unbonding: userStaking.data?.unbonding.unbonding_responses ?? [],
        },
      };
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: options?.refetchInterval ?? 5000,
    }
  );

  // user native token balance
  const { data: userCantoBalance } = useBalance({
    chainId: params.chainId,
    address: params.userEthAddress as `0x${string}`,
  });

  ///
  /// Internal state for user selection
  ///
  const [selectedValidatorAddress, setSelectedValidatorAddress] = useState<
    string | null
  >(null);
  const getValidator = (
    address: string | null
  ): ValidatorWithDelegations | null => {
    if (!address) return null;
    // search for user validator first
    const userValidator = staking?.userStaking?.validators.find(
      (validator) => validator.operator_address === address
    );
    if (userValidator) return userValidator;
    // search for all validators
    const validator = staking?.validators.find(
      (validator) => validator.operator_address === address
    );
    if (validator)
      return { ...validator, userDelegation: { balance: "0", rewards: "0" } };
    return null;
  };

  ///
  /// External Functions
  ///
  function validateParams(
    txParams: StakingTransactionParams
  ): Validation {
    // make sure userEthAddress is set and same as params
    if (!areEqualAddresses(txParams.ethAccount, params.userEthAddress ?? "")) {
      return {
        error: true,
        reason: "user eth address is not the same",
      };
    }
    // switch depending on tx type
    switch (txParams.txType) {
      case StakingTxTypes.DELEGATE:
        // amount just has to be less than canto balance
        return validateNonWeiUserInputTokenAmount(
          txParams.amount,
          "0",
          userCantoBalance?.value.toString() ?? "0",
          "CANTO",
          18
        );
      case StakingTxTypes.UNDELEGATE:
      case StakingTxTypes.REDELEGATE: {
        // just need to make sure amount is less than user delegation balance
        const validator = getValidator(txParams.validatorAddress);
        if (
          !validator ||
          !(validator as ValidatorWithDelegations).userDelegation
        )
          return { error: true, reason: "validator not found" };

        return validateNonWeiUserInputTokenAmount(
          txParams.amount,
          "0",
          (validator as ValidatorWithDelegations).userDelegation?.balance ??
            "0",
          "CANTO",
          18
        );
      }
      default:
        return { error: true, reason: "tx type not found" };
    }
  }

  function createNewStakingFlow(
    params: StakingTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateParams(params);
    if (validation.error)
      return NEW_ERROR("createNewStakingFlow" + validation.reason);
    return createNewStakingTxFlow(params);
  }
  return {
    isLoading,
    validators: staking?.validators ?? [],
    apr: staking?.apr ?? "0",
    selection: {
      validator: getValidator(selectedValidatorAddress),
      setValidator: setSelectedValidatorAddress,
    },
    transaction: {
      validateParams,
      createNewStakingFlow,
    },
    userStaking: {
      validators: staking?.userStaking?.validators ?? [],
      unbonding: staking?.userStaking?.unbonding ?? [],
      cantoBalance: userCantoBalance?.value.toString() ?? "0",
    },
  };
}
