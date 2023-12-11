import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { CToken, CTokenWithUserData } from "../interfaces/tokens";
import { UserLMPosition } from "../interfaces/userPositions";
import { getUserCLMLensData } from "./clmLens";
import { getLMTotalsFromCTokens } from "./cTokenTotals";
import { areEqualAddresses, listIncludesAddress } from "@/utils/address";
import { getCantoApiData } from "@/config/api/canto-api";
import { CANTO_DATA_API_ENDPOINTS } from "@/config/api";

/**
 * @notice Gets all user data from clmLens and general api
 * @param {string} userEthAddress address to get data for
 * @param {number} chainId chainId to get data for
 * @returns {PromiseWithError<{cTokens: CTokenWithUserData[], position?: UserLMPosition}>}
 */
export async function getAllUserCLMData(
  userEthAddress: string,
  chainId: number,
  cTokenAddresses: string[]
): PromiseWithError<{
  cTokens: CTokenWithUserData[];
  position?: UserLMPosition;
}> {
  // get data from clmLens and general api
  const [generalCTokens, userLMData] = await Promise.all([
    getCantoApiData<CToken[]>(chainId, CANTO_DATA_API_ENDPOINTS.allCTokens),
    getUserCLMLensData(userEthAddress, chainId, cTokenAddresses),
  ]);
  // check general error first
  if (generalCTokens.error) {
    return NEW_ERROR("getAllUserCLMData::" + errMsg(generalCTokens.error));
  }
  // remove cTokens from general data that are not in the cTokenAddresses list
  const filteredCTokens = generalCTokens.data.filter((cToken) =>
    listIncludesAddress(cTokenAddresses, cToken.address)
  );
  // return general data if no user
  if (!userEthAddress) {
    return NO_ERROR({
      cTokens: filteredCTokens,
    });
  }
  // there will be an error if no address is provided (if user is present, return error)
  if (userLMData.error && userEthAddress) {
    return NEW_ERROR("getAllUserCLMData::" + errMsg(userLMData.error));
  }

  // since user is present, combine the data
  const combinedCTokenData = filteredCTokens.map((cToken) => {
    const userCTokenDetails = userLMData.data.cTokens.find((userCToken) =>
      areEqualAddresses(userCToken.cTokenAddress, cToken.address)
    );
    if (userCTokenDetails) {
      return {
        ...cToken,
        userDetails: userCTokenDetails,
      };
    }
    return cToken;
  });
  // get total user positions
  const { data: positionTotals, error: positionError } = getLMTotalsFromCTokens(
    combinedCTokenData,
    userLMData.data.compAccrued.toString()
  );
  if (positionError) {
    return NO_ERROR({
      cTokens: combinedCTokenData,
    });
  }
  const userTotalPosition = {
    liquidity: userLMData.data.limits.liquidity.toString(),
    shortfall: userLMData.data.limits.shortfall.toString(),
    totalSupply: positionTotals.totalSupply,
    totalBorrow: positionTotals.totalBorrow,
    totalRewards: positionTotals.totalRewards,
    avgApr: positionTotals.avgApr,
  };

  // sort data to make it predicatble for hooks
  return NO_ERROR({
    cTokens: combinedCTokenData.sort((a, b) => (a.symbol > b.symbol ? 1 : -1)),
    position: userTotalPosition,
  });
}
