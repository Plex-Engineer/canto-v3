import { useQuery } from "react-query";
import { getAllUserStakingData } from "./helpers/userStaking";
import {
  StakingHookInputParams,
  UserStakingHookReturn,
} from "./interfaces/hookParams";

export default function useUserStaking(
  params: StakingHookInputParams,
  options?: { refetchInterval?: number }
): UserStakingHookReturn {
  const { data: staking, isLoading } = useQuery(
    ["staking", params.chainId, params.userEthAddress],
    async () => {
      const [userStaking] = await Promise.all([
        getAllUserStakingData(params.chainId, params.userEthAddress),
      ]);

      if (userStaking.error) {
        return {
          userStaking: [],
        };
      }
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
  return staking ? staking : { userStaking: [] };
}
