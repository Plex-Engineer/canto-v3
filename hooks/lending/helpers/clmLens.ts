import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { UserCTokenDetails } from "@/hooks/lending/interfaces/tokens";
import { isValidEthAddress } from "@/utils/address";
import { newContractInstance } from "@/utils/evm";
import { CLM_LENS_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { isCantoChainId } from "@/utils/networks";
import { getCantoCoreAddress } from "@/config/consts/addresses";

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
        getCantoCoreAddress(chainId, "clmLens"),
        getCantoCoreAddress(chainId, "comptroller"),
      ];
      // make sure addresses exist
      if (!cTokenAddresses || !lensAddress || !comptrollerAddress) {
        throw Error("getUserCLMLensData: chainId not supported");
      }
      // get lens contract
      const { data: lensContract, error: lensError } = newContractInstance<
        typeof CLM_LENS_ABI
      >(chainId, lensAddress, CLM_LENS_ABI);
      if (lensError) throw lensError;

      // get comptroller contract
      const { data: comptrollerContract, error: comptrollerError } =
        newContractInstance<typeof COMPTROLLER_ABI>(
          chainId,
          comptrollerAddress,
          COMPTROLLER_ABI
        );
      if (comptrollerError) throw comptrollerError;

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
            chainId,
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
        }),
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
