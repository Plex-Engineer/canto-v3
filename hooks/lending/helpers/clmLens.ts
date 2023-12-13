import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { UserCTokenDetails } from "@/hooks/lending/interfaces/tokens";
import { isValidEthAddress } from "@/utils/address";
import { CLM_LENS_ABI, COMPTROLLER_ABI } from "@/config/abis";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { multicall } from "wagmi/actions";

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
  try {
    if (!isValidEthAddress(userEthAddress)) {
      throw Error("getUserCLMLensData: invalid userEthAddress");
    }
    // get all addresses depending on chainId
    const [lensAddress, comptrollerAddress] = [
      getCantoCoreAddress(chainId, "clmLens"),
      getCantoCoreAddress(chainId, "comptroller"),
    ];
    // make sure addresses exist
    if (!cTokenAddresses || !lensAddress || !comptrollerAddress) {
      throw Error("getUserCLMLensData: chainId not supported");
    }

    // use multicall to save eth calls to node
    const contractCalls = [
      {
        address: lensAddress,
        abi: CLM_LENS_ABI,
        functionName: "cTokenBalancesAll",
        args: [
          comptrollerAddress,
          cTokenAddresses as `0x${string}`[],
          userEthAddress,
        ],
      },
      {
        address: lensAddress,
        abi: CLM_LENS_ABI,
        functionName: "getAccountLimits",
        args: [comptrollerAddress, userEthAddress],
      },
      {
        address: comptrollerAddress,
        abi: COMPTROLLER_ABI,
        functionName: "compAccrued",
        args: [userEthAddress],
      },
    ] as const;
    const [cTokenBalances, accountLimits, accruedRewards] = await multicall({
      chainId,
      contracts: contractCalls,
    });

    // check all results are present and successful
    if (
      !(
        cTokenBalances &&
        accountLimits &&
        accruedRewards &&
        cTokenBalances.status === "success" &&
        accountLimits.status === "success" &&
        accruedRewards.status === "success"
      )
    ) {
      throw Error("getUserCLMLensData: multicall error");
    }

    // format results
    const cTokens = cTokenBalances.result.map((data) => ({
      chainId,
      cTokenAddress: data.cTokenAddress,
      balanceOfCToken: data.balanceOfCToken.toString(),
      balanceOfUnderlying: data.balanceOfUnderlying.toString(),
      borrowBalance: data.borrowBalance.toString(),
      rewards: data.rewards.toString(),
      isCollateral: data.isCollateral,
      supplyBalanceInUnderlying: data.supplyBalanceInUnderlying.toString(),
      underlyingAllowance: data.underlyingAllowance.toString(),
    }));
    const limits = {
      liquidity: Number(accountLimits.result.liquidity),
      shortfall: Number(accountLimits.result.shortfall),
    };
    const compAccrued = Number(accruedRewards.result);

    return NO_ERROR({ cTokens, limits, compAccrued });
  } catch (err) {
    return NEW_ERROR("getUserCLMLensData: " + errMsg(err));
  }
}
