import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import {
  DelegationResponse,
  DelegationRewardResponse,
  UnbondingDelegationResponse,
  ValidatorWithDelegations,
} from "../interfaces/validators";
import { ethToCantoAddress } from "@/utils/address";
import { tryFetch } from "@/utils/async";
import { getCosmosAPIEndpoint } from "@/utils/networks";

type EndpointType = "delegations" | "unbonding" | "rewards";

const endpointUserStaking = (
  chainId: number,
  cantoAddress: string,
  endpointType: EndpointType
): string => {
  // get cosmos endpoint
  const { data: endpoint, error } = getCosmosAPIEndpoint(chainId);
  if (error) return "";
  // get suffix based on endpoint type
  let suffix = "";
  switch (endpointType) {
    case "delegations":
      suffix = "/cosmos/staking/v1beta1/delegations/" + cantoAddress;
      break;
    case "unbonding":
      suffix =
        "/cosmos/staking/v1beta1/delegators/" +
        cantoAddress +
        "/unbonding_delegations";
      break;
    case "rewards":
      suffix =
        "/cosmos/distribution/v1beta1/delegators/" + cantoAddress + "/rewards";
      break;
    default:
      return "";
  }
  // return endpoint with suffix
  return endpoint + suffix;
};

export async function getAllUserStakingData(
  chainId: number,
  userEthAddress: string
): PromiseWithError<{
  delegations: DelegationResponse;
  unbonding: UnbondingDelegationResponse;
  rewards: DelegationRewardResponse;
}> {
  // wrap entire call into try/catch for error handling
  try {
    // convert to canto address
    const { data: cantoAddress, error: cantoAddressError } =
      await ethToCantoAddress(userEthAddress);
    if (cantoAddressError) throw cantoAddressError;

    // get all data with await Promise.all
    const userStakingData = await Promise.all([
      tryFetch<DelegationResponse>(
        endpointUserStaking(chainId, cantoAddress, "delegations")
      ),
      tryFetch<UnbondingDelegationResponse>(
        endpointUserStaking(chainId, cantoAddress, "unbonding")
      ),
      tryFetch<DelegationRewardResponse>(
        endpointUserStaking(chainId, cantoAddress, "rewards")
      ),
    ]);
    // check for errors
    if (userStakingData.some((data) => data.error)) {
      throw userStakingData.find((data) => data.error)?.error;
    }
    // return data
    return NO_ERROR({
      delegations: userStakingData[0].data,
      unbonding: userStakingData[1].data,
      rewards: userStakingData[2].data,
    });
  } catch (err) {
    return NEW_ERROR("getAllUserStakingData::" + errMsg(err));
  }
}

export function getBalanceForValidator(userStakings: ValidatorWithDelegations[], validatorAddress: string): string | null {
  console.log(userStakings);
  if(userStakings){
    console.log(userStakings.length);
    if(userStakings.length>0){
      const staking = userStakings.find(stake => stake.operator_address === validatorAddress);
      console.log(staking);
      console.log(staking?.userDelegation.balance);
      return staking ? staking.userDelegation.balance : null;
    }
    return null;
    
  }
  return null;
}
