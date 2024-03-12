import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  UserTokenBalances,
  ERC20Token,
} from "@/config/interfaces";
import { fetchBalance, multicall } from "wagmi/actions";
import BigNumber from "bignumber.js";
import { ERC20_ABI } from "@/config/abis";
import { newContractInstance } from "../evm";

/**
 * @notice gets all token balances from ethereum chain
 * @param {number} chainId chainId to get balances from
 * @param {ERC20Token[]} tokens tokens to get balances for
 * @param {string} userEthAddress ethereum address to get balances for
 * @returns {PromiseWithError<UserTokenBalances>} balances of all tokens as a string or error
 */
export async function getEVMTokenBalanceList(
  chainId: number,
  tokens: ERC20Token[],
  userEthAddress: string
): PromiseWithError<UserTokenBalances> {
  try {
    const multicallConfig = tokens.map((token) => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [userEthAddress],
    }));
    const data = await multicall({
      chainId,
      contracts: multicallConfig,
    });
    const balances: UserTokenBalances = {};
    await Promise.all(
      data.map(async (result, index) => {
        if (!tokens[index].nativeWrappedToken) {
          // set balance to 0 if error
          balances[tokens[index].id] = result.error
            ? "0"
            : (result.result as number).toString();
        } else {
          // get native balance
          const nativeBalance = await fetchBalance({
            address: userEthAddress as `0x${string}`,
            chainId,
          });
          // get token balance (if error set to 0, could be intentional error)
          const ercBalance = result.error
            ? BigInt(0)
            : (result.result as bigint);
          // add balances and set as string
          balances[tokens[index].id] = (
            nativeBalance.value + ercBalance
          ).toString();
        }
      })
    );
    return NO_ERROR(balances);
  } catch (err) {
    return NEW_ERROR("getTokenBalanceList", err);
  }
}

/**
 * @notice gets token balance from ethereum chain
 * @param {number} chainId chainId to get balance from
 * @param {string} tokenAddress token address to get balance for
 * @param {string} account ethereum address to get balance for
 * @returns {PromiseWithError<BigNumber>} balance of token as a string or error
 */
export async function getTokenBalance(
  chainId: number,
  tokenAddress: string,
  account: string
): PromiseWithError<BigNumber> {
  try {
    const { data: tokenContract, error } = newContractInstance<
      typeof ERC20_ABI
    >(chainId, tokenAddress, ERC20_ABI);
    if (error) throw error;
    const balance = await tokenContract.methods.balanceOf(account).call();
    return NO_ERROR(new BigNumber(balance as string));
  } catch (err) {
    return NEW_ERROR("getTokenBalance", err);
  }
}

/**
 * @notice checks token allowance from ethereum chain
 * @param {number} chainId chainId to get allowance from
 * @param {string} tokenAddress token address to get allowance for
 * @param {string} account ethereum account who holds the token
 * @param {string} spender ethereum spender to get allowance for
 * @param {string} amount amount to check allowance for
 * @returns {PromiseWithError<BigNumber>} true if allowance is greater than amount, false otherwise
 */
export async function checkTokenAllowance(
  chainId: number,
  tokenAddress: string,
  account: string,
  spender: string,
  amount: string
): PromiseWithError<{ hasEnoughAllowance: boolean; allowance: string }> {
  try {
    const { data: tokenContract, error } = newContractInstance<
      typeof ERC20_ABI
    >(chainId, tokenAddress, ERC20_ABI);
    if (error) throw error;
    const allowance = await tokenContract.methods
      .allowance(account, spender)
      .call();
    return NO_ERROR({
      hasEnoughAllowance: new BigNumber(
        allowance as string
      ).isGreaterThanOrEqualTo(amount),
      allowance: allowance as string,
    });
  } catch (err) {
    return NEW_ERROR("checkTokenAllowance", err);
  }
}
