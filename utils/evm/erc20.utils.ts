import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import BigNumber from "bignumber.js";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "./helpers.utils";
import { Contract } from "web3";
import { ERC20_ABI } from "@/config/abis";
import { Transaction } from "@/config/interfaces/transactions";
import { ERC20Token } from "@/config/interfaces/tokens";
import { multicall } from "wagmi/actions";
import { UserTokenBalances } from "@/hooks/bridge/interfaces/tokens";

// appends balance property to each object in array
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
    data.forEach((result, index) => {
      if (result.error) {
        balances[tokens[index].id] = "0";
      } else {
        balances[tokens[index].id] = (result.result as number).toString();
      }
    });
    return NO_ERROR(balances);
  } catch (err) {
    return NEW_ERROR("getTokenBalanceList::" + (err as Error).message);
  }
}

export async function getTokenBalance(
  chainId: number,
  tokenAddress: string,
  account: string
): PromiseWithError<BigNumber> {
  try {
    const { data: rpcUrl, error } = getRpcUrlFromChainId(chainId);
    if (error) {
      throw new Error(error.message);
    }
    const tokenContract = new Contract(
      ERC20_ABI,
      tokenAddress,
      getProviderWithoutSigner(rpcUrl)
    );
    const balance = await tokenContract.methods.balanceOf(account).call();
    return NO_ERROR(new BigNumber(balance as string));
  } catch (error) {
    return NEW_ERROR("getTokenBalance::" + (error as Error).message);
  }
}

export async function checkTokenAllowance(
  chainId: number,
  tokenAddress: string,
  account: string,
  spender: string,
  amount: string
): PromiseWithError<boolean> {
  try {
    const { data: rpcUrl, error } = getRpcUrlFromChainId(chainId);
    if (error) {
      throw new Error(error.message);
    }
    const tokenContract = new Contract(
      ERC20_ABI,
      tokenAddress,
      getProviderWithoutSigner(rpcUrl)
    );
    const allowance = await tokenContract.methods
      .allowance(account, spender)
      .call();
    return NO_ERROR(
      new BigNumber(allowance as string).isGreaterThanOrEqualTo(amount)
    );
  } catch (error) {
    return NEW_ERROR("checkTokenAllowance::" + (error as Error).message);
  }
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

export const _approveTx = (
  chainId: number,
  tokenAddress: string,
  spender: string,
  amount: string,
  description: string
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: tokenAddress,
  abi: ERC20_ABI,
  method: "approve",
  params: [spender, amount],
  value: "0",
});
