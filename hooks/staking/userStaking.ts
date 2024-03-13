import { useQuery } from "react-query";
import { getAllUserStakingData } from "./helpers/userStaking";
import {
  StakingHookInputParams,
  UserStakingHookReturn,
} from "./interfaces/hookParams";
import { ValidatorWithDelegations } from "./interfaces/validators";

export default function useUserStaking(
  params: StakingHookInputParams,
  options?: { refetchInterval?: number }
): UserStakingHookReturn | undefined {
  const { data: staking, isLoading } = useQuery(
    ["staking", params.chainId, params.userEthAddress],
    async () => {
      const [userStaking] = await Promise.all([
        getAllUserStakingData(params.chainId, params.userEthAddress),
      ]);

      // check if all validators error
      //if (allValidators.error) throw allValidators.error;

      // if user staking data error, return all validators only
      if (userStaking.error) {
        return {
          userStaking: [],
        };
      }
      // combine user delegation data with validator data
      const userValidators: {
        validator_address: string;
        balance: string;
        rewards: string;
      }[] = [];
      // console.log(userStaking);
      // go through each user delegation
      if (
        userStaking.data.delegations &&
        userStaking.data.delegations.length > 0
      ) {
        userStaking.data.delegations.forEach((delegation) => {
          // const validator = allValidators.data.find(
          //   (val) =>
          //     val.operator_address === delegation.delegation.validator_address
          // );
          const rewards =
            userStaking.data.rewards.rewards
              .find(
                (rew) =>
                  rew.validator_address ===
                  delegation.delegation.validator_address
              )
              ?.reward?.find((bal) => bal.denom === "acanto")?.amount ?? "0";

          userValidators.push({
            validator_address: delegation.delegation.validator_address,
            balance: delegation.balance.amount,
            rewards: rewards,
          });
        });
      }

      return { userStaking: userValidators };
    },
    {
      onError: (error) => {
        console.error(error);
      },
    }
  );
  return staking;
}
