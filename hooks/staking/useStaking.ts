import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import { Validator, ValidatorWithDelegations } from "./interfaces/validators";
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
} from "../../transactions/staking/interfaces/stakingTxTypes";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";

import { useBalance } from "wagmi";

import { createNewStakingTxFlow } from "../../transactions/staking/interfaces/createNewStakingFlow";
import { areEqualAddresses, isValidEthAddress } from "@/utils/address";
import { validateNonWeiUserInputTokenAmount } from "@/utils/math";
import { NewTransactionFlow } from "@/transactions/flows/types";
import useCantoSigner from "../helpers/useCantoSigner";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { validateStakingTxParams } from "@/transactions/staking/transactions/staking";

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
        getAllUserStakingData(params.chainId, params.userEthAddress),
      ]);

      // combine user delegation data with validator data
      const userValidators: ValidatorWithDelegations[] = [];
      if (allValidators.error) throw allValidators.error;

      if (
        userStaking.data &&
        userStaking.data.delegations &&
        userStaking.data.delegations.length > 0 &&
        allValidators.data
      ) {
        userStaking.data.delegations.forEach((delegation) => {
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
              ?.reward.find((balance) => balance.denom === "acanto")?.amount ??
            "0";
          if (validator) {
            userValidators.push({
              ...validator,
              userDelegation: {
                balance: delegation.balance.amount,
                rewards: rewards,
              },
            });
          }
        });
      }
      return {
        validators: allValidators.data,
        apr: stakingApr.data,
        userStaking: {
          validators: userValidators,
          unbonding: userStaking.data?.unbondingDelegations ?? [],
        },
      };
    },
    {
      onSuccess: (data) => {
        //console.log(data);
      },
      onError: (error) => {
        console.error(error);
      },
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
  function createNewStakingFlow(
    params: StakingTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateStakingTxParams(params);
    if (validation.error)
      return NEW_ERROR("createNewStakingFlow" + validation.error.message);
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
      validateStakingTxParams,
      createNewStakingFlow,
    },
    userStaking: {
      validators: staking?.userStaking?.validators ?? [],
      unbonding: staking?.userStaking?.unbonding ?? [],
      cantoBalance: userCantoBalance?.value.toString() ?? "0",
    },
  };
}

///
/// External Functions
///
