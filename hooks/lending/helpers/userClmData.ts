import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { CTokenWithUserData } from "../interfaces/tokens";
import { UserLMPosition } from "../interfaces/userPositions";
import { getGeneralCTokenData, getUserCLMLensData } from "./clmLens";
import { getLMTotalsFromCTokens } from "./cTokens";

/**
 * @notice Gets all user data from clmLens and general api
 * @param {string} userEthAddress address to get data for
 * @param {number} chainId chainId to get data for
 * @returns {PromiseWithError<{cTokens: CTokenWithUserData[], position?: UserLMPosition}>}
 */
export async function getAllUserCLMData(
  userEthAddress: string,
  chainId: number
): PromiseWithError<{
  cTokens: CTokenWithUserData[];
  position?: UserLMPosition;
}> {
  // get data from clmLens and general api
  const [generalCTokens, userLMData] = await Promise.all([
    getGeneralCTokenData(chainId),
    getUserCLMLensData(userEthAddress, chainId),
  ]);
  // check errors and return what is available
  // if general error, then return error now
  if (generalCTokens.error) {
    return NEW_ERROR("getAllUserCLMData::" + errMsg(generalCTokens.error));
  }
  // if user error, then just return the general data
  if (userLMData.error) {
    console.log(userLMData.error);
    return NO_ERROR({ cTokens: generalCTokens.data });
  }
  // since both are okay, combine the data
  const combinedCTokenData = generalCTokens.data.map((cToken) => {
    const userCTokenDetails = userLMData.data.cTokens.find((userCToken) => {
      return (
        userCToken.cTokenAddress.toLowerCase() === cToken.address.toLowerCase()
      );
    });
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
  };

  return NO_ERROR({ cTokens: combinedCTokenData, position: userTotalPosition });
}
