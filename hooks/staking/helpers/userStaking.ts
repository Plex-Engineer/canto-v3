import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import {
  UserStakingReturn,
  ValidatorWithDelegations,
} from "../interfaces/validators";
import { ethToCantoAddress } from "@/utils/address";
import { tryFetch } from "@/utils/async";
import { getCosmosAPIEndpoint } from "@/utils/networks";
import * as NETWORKS from "@/config/networks";
import * as COSMOS_NETWORKS from "@/config/networks/cosmos";

type EndpointType = "delegations" | "unbonding" | "rewards";

const cantoMainnetUserAPIEndpoint = "https://mainnet-user-api.plexnode.wtf"; //process.env.NEXT_PUBLIC_CANTO_USER_API_URL;
const cantoTestnetUserAPIEndpoint = "https://localhost:9000";

function getUserAPIEndPoint(chainId: number | string) {
  if (typeof chainId === "number") {
    // if number is passed in, it must be one of the Canto EVM chains
    switch (chainId) {
      case NETWORKS.CANTO_MAINNET_EVM.chainId:
        return NO_ERROR(cantoMainnetUserAPIEndpoint);
      case NETWORKS.CANTO_TESTNET_EVM.chainId:
        return NO_ERROR(cantoTestnetUserAPIEndpoint);
      default:
        return NEW_ERROR(
          "getCosmosUserAPIEndpoint",
          "Invalid chainId: " + chainId
        );
    }
  } else {
    return NEW_ERROR(
      "getCosmosUserAPIEndpoint",
      "Network not found: " + chainId
    );
  }
}

const endpointUserStaking = (
  chainId: number,
  cantoAddress: string,
  endpointType?: string
): string => {
  // get cosmos endpoint
  const { data: endpoint, error } = getUserAPIEndPoint(chainId);
  if (error) throw error;
  // get suffix based on endpoint type
  const suffix = "/v1/user/native/" + cantoAddress;
  // return endpoint with suffix
  return endpoint + suffix;
};

export async function getAllUserStakingData(
  chainId: number,
  userEthAddress: string | undefined
): PromiseWithError<UserStakingReturn> {
  // wrap entire call into try/catch for error handling
  try {
    // convert to canto address
    if (!userEthAddress)
      return NO_ERROR({
        delegations: [],
        unbondingDelegations: [],
        rewards: {
          rewards: [],
          total: [],
        },
      });
    const { data: cantoAddress, error: cantoAddressError } =
      await ethToCantoAddress(userEthAddress);
    if (cantoAddressError) throw cantoAddressError;

    const userStakingData = await tryFetch<UserStakingReturn>(
      endpointUserStaking(chainId, cantoAddress)
    );
    if (userStakingData.error) throw userStakingData.error;

    // return data
    return NO_ERROR(userStakingData.data);
  } catch (err) {
    return NEW_ERROR("getAllUserStakingData::" + errMsg(err));
  }
}

export function getBalanceForValidator(
  userStakings: ValidatorWithDelegations[],
  validatorAddress: string
): string | null {
  if (userStakings) {
    if (userStakings.length > 0) {
      const staking = userStakings.find(
        (stake) => stake.operator_address === validatorAddress
      );
      return staking ? staking.userDelegation.balance : null;
    }
    return null;
  }
  return null;
}
