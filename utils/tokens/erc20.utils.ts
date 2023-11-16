import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  UserTokenBalances,
  Transaction,
  TransactionDescription,
  ERC20Token,
} from "@/config/interfaces";
import { fetchBalance, multicall } from "wagmi/actions";
import BigNumber from "bignumber.js";
import { ERC20_ABI } from "@/config/abis";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
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
async function checkTokenAllowance(
  chainId: number,
  tokenAddress: string,
  account: string,
  spender: string,
  amount: string
): PromiseWithError<boolean> {
  try {
    const { data: tokenContract, error } = newContractInstance<
      typeof ERC20_ABI
    >(chainId, tokenAddress, ERC20_ABI);
    if (error) throw error;
    const allowance = await tokenContract.methods
      .allowance(account, spender)
      .call();
    return NO_ERROR(
      new BigNumber(allowance as string).isGreaterThanOrEqualTo(amount)
    );
  } catch (err) {
    return NEW_ERROR("checkTokenAllowance", err);
  }
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

/**
 * @notice creates a transaction to approve a token
 * @dev must be the same spender for all tokens
 * @param {number} chainId chainId to create transaction for
 * @param {string} ethAccount ethereum account of user
 * @param {{address: string; symbol: string;}[]} tokens token addresses to approve
 * @param {string[]} amounts amounts to approve for each token
 * @param {{ address: string; name: string }} spender ethereum spender
 * @returns {Transaction} transactions to approve tokens
 */
export async function createApprovalTxs(
  chainId: number,
  ethAccount: string,
  tokens: { address: string; symbol: string }[],
  amounts: string[],
  spender: { address: string; name: string }
): PromiseWithError<Transaction[]> {
  // make param checks
  if (tokens.length !== amounts.length) {
    return NEW_ERROR(
      "createApprovalTxs::tokenAddresses and amounts must be same length"
    );
  }
  /** create tx list */
  const txList: Transaction[] = [];
  // check allowance for each token
  const allowanceChecks = await Promise.all(
    tokens.map(async (token, index) =>
      checkTokenAllowance(
        chainId,
        token.address,
        ethAccount,
        spender.address,
        amounts[index]
      )
    )
  );
  if (allowanceChecks.some((check) => check.error)) {
    return NEW_ERROR("createApprovalTxs: error getting token allowances");
  }
  // create tx for each token that needs approval
  allowanceChecks.forEach((check, index) => {
    if (!check.data) {
      txList.push(
        _approveTx(
          chainId,
          tokens[index].address,
          spender.address,
          amounts[index],
          TX_DESCRIPTIONS.APPROVE_TOKEN(tokens[index].symbol, spender.name)
        )
      );
    }
  });
  // return tx list
  return NO_ERROR(txList);
}

const _approveTx = (
  chainId: number,
  tokenAddress: string,
  spender: string,
  amount: string,
  description: TransactionDescription
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
