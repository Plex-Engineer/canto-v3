import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { CToken, UserCTokenDetails } from "@/hooks/lending/interfaces/tokens";
import {
  MAINNET_CTOKEN_ADDRESSES,
  TESTNET_CTOKEN_ADDRESSES,
} from "@/hooks/lending/config/cTokenAddresses";
import {
  CLM_LENS_ADDRESS,
  COMPTROLLER_ADDRESS,
} from "@/config/consts/addresses";
import { isValidEthAddress } from "@/utils/address.utils";
import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "@/utils/evm/helpers.utils";
import { Contract } from "web3";
import { CLM_LENS_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { tryFetch } from "@/utils/async.utils";
import {
  CANTO_DATA_API_ENDPOINTS,
  CANTO_DATA_API_URL,
  GeneralCTokenResponse,
} from "@/config/consts/apiUrls";

/**
 * @notice Gets user data from CLM Lens
 * @param {string} userEthAddress Ethereum address of user
 * @param {boolean} testnet Whether to use testnet or mainnet
 * @returns {PromiseWithError<{ balances: UserCTokenDetails[]; limits: {liquidity: number} }>}
 */
export async function getUserCLMLensData(
  userEthAddress: string,
  testnet: boolean = false
): PromiseWithError<{
  balances: UserCTokenDetails[];
  limits: { liquidity: number; shortfall: number };
  compAccrued: number;
}> {
  if (isValidEthAddress(userEthAddress)) {
    try {
      // get all addresses depending on testnet
      const [cTokenAddresses, lensAddress, comptrollerAddress, chainId] = [
        testnet ? TESTNET_CTOKEN_ADDRESSES : MAINNET_CTOKEN_ADDRESSES,
        CLM_LENS_ADDRESS[testnet ? "testnet" : "mainnet"],
        COMPTROLLER_ADDRESS[testnet ? "testnet" : "mainnet"],
        testnet ? CANTO_TESTNET_EVM.chainId : CANTO_MAINNET_EVM.chainId,
      ];
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

      const [balances, limits, compAccrued] = await Promise.all([
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
            compSupplierIndex: data.compSupplierIndex.toString(),
            isCollateral: data.isCollateral,
            suppyBalanceInUnderlying: data.supplyBalanceInUnderlying.toString(),
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

      return NO_ERROR({ balances, limits, compAccrued });
    } catch (err) {
      return NEW_ERROR("getUserCLMLensData: " + errMsg(err));
    }
  }
  return NEW_ERROR(
    "getUserCLMLensData: Invalid Ethereum Address: " + userEthAddress
  );
}

/**
 * @notice Gets general cToken data from Canto Data API
 * @dev Currently only supports mainnet
 * @param {boolean} testnet Whether to use testnet or mainnet
 * @returns {PromiseWithError<CToken[]>} List of cTokens
 */
export async function getGeneralCTokenData(
  testnet: boolean = false
): PromiseWithError<CToken[]> {
  //no api for testnet yet
  if (testnet) return NEW_ERROR("getGeneralCTokenData: Testnet not supported");
  // get full response
  const { data, error } = await tryFetch<GeneralCTokenResponse>(
    testnet ? "" : CANTO_DATA_API_URL + CANTO_DATA_API_ENDPOINTS.allCTokens
  );
  if (error) {
    return NEW_ERROR("getGeneralCTokenData: " + errMsg(error));
  }
  return NO_ERROR(data.cTokens);
}
