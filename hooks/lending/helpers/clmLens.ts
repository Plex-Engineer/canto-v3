import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { CToken, UserCTokenDetails } from "@/hooks/lending/interfaces/tokens";
import { isValidEthAddress } from "@/utils/address.utils";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "@/utils/evm/helpers.utils";
import { Contract } from "web3";
import { CLM_LENS_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { tryFetch } from "@/utils/async.utils";
import { isCantoChainId } from "@/utils/networks.utils";
import { getCLMAddress } from "@/config/consts/addresses";
import { CANTO_DATA_API } from "@/config/api";

/**
 * @notice Gets user data from CLM Lens
 * @param {string} userEthAddress Ethereum address of user
 * @param {number} chainId Whether to use testnet or mainnet
 * @param {string[]} cTokenAddresses List of cToken addresses to get data for
 * @returns {PromiseWithError<{ cTokens: UserCTokenDetails[]; limits: {liquidity: number}, compAccrued: number }>}
 */
export async function getUserCLMLensData(
  userEthAddress: string,
  chainId: number,
  cTokenAddresses: string[]
): PromiseWithError<{
  cTokens: UserCTokenDetails[];
  limits: { liquidity: number; shortfall: number };
  compAccrued: number;
}> {
  if (isValidEthAddress(userEthAddress) || !isCantoChainId(chainId)) {
    try {
      // get all addresses depending on chainId
      const [lensAddress, comptrollerAddress] = [
        getCLMAddress(chainId, "clmLens"),
        getCLMAddress(chainId, "comptroller"),
      ];
      // make sure addresses exist
      if (!cTokenAddresses || !lensAddress || !comptrollerAddress) {
        throw Error("getUserCLMLensData: chainId not supported");
      }
      const { data: rpcUrl, error } = getRpcUrlFromChainId(chainId);
      if (error) {
        throw error;
      }
      // create contract instances
      const lensContract = new Contract(
        CLM_LENS_ABI,
        lensAddress,
        getProviderWithoutSigner(rpcUrl)
      );

      const comptrollerContract = new Contract(
        COMPTROLLER_ABI,
        comptrollerAddress,
        getProviderWithoutSigner(rpcUrl)
      );

      const [cTokens, limits, compAccrued] = await Promise.all([
        (
          await lensContract.methods
            .cTokenBalancesAll(
              comptrollerAddress,
              cTokenAddresses,
              userEthAddress
            )
            .call()
        ).map((data) => {
          return {
            cTokenAddress: data.cTokenAddress,
            balanceOfCToken: data.balanceOfCToken.toString(),
            balanceOfUnderlying: data.balanceOfUnderlying.toString(),
            borrowBalance: data.borrowBalance.toString(),
            rewards: data.rewards.toString(),
            isCollateral: data.isCollateral,
            supplyBalanceInUnderlying:
              data.supplyBalanceInUnderlying.toString(),
            underlyingAllowance: data.underlyingAllowance.toString(),
          };
        }) as UserCTokenDetails[],
        lensContract.methods
          .getAccountLimits(comptrollerAddress, userEthAddress)
          .call() as Promise<{ liquidity: number; shortfall: number }>,
        comptrollerContract.methods
          .compAccrued(userEthAddress)
          .call() as Promise<number>,
      ]);

      return NO_ERROR({ cTokens, limits, compAccrued });
    } catch (err) {
      return NEW_ERROR("getUserCLMLensData: " + errMsg(err));
    }
  }
  return NEW_ERROR(
    "getUserCLMLensData: Invalid Params: " + userEthAddress + " " + chainId
  );
}

/**
 * @notice Gets general cToken data from Canto Data API
 * @dev Currently only supports mainnet
 * @param {number} chainId Whether to use testnet or mainnet
 * @returns {PromiseWithError<CToken[]>} List of cTokens
 */
export async function getGeneralCTokenData(
  chainId: number
): PromiseWithError<CToken[]> {
  if (!isCantoChainId(chainId)) {
    return NEW_ERROR("getGeneralCTokenData: Invalid chainId " + chainId);
  }
  //no api for testnet yet
  if (chainId === 7701)
    return NEW_ERROR("getGeneralCTokenData: Testnet not supported");
  // get full response
  const { data, error } = await tryFetch<{
    blockNumber: string;
    cTokens: CToken[];
  }>(CANTO_DATA_API.allCTokens);
  if (error) {
    return NEW_ERROR("getGeneralCTokenData: " + errMsg(error));
  }
  return NO_ERROR(data.cTokens);
}
