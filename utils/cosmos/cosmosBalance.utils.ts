import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  UserTokenBalances,
} from "@/config/interfaces";
import { tryFetch } from "../async";
import {
  getCosmosAPIEndpoint,
  getNetworkInfoFromChainId,
  isCosmosNetwork,
} from "../networks";

/**
 * @notice gets canto balance from cosmos
 * @param {string} chainId chainId to get canto balance from
 * @param {string} cantoAddress canot address to get balance for
 * @returns {PromiseWithError<string>} balance of canto as a string or error
 */
export async function getCantoBalance(
  chainId: string,
  cantoAddress: string
): PromiseWithError<string> {
  return await getCosmosTokenBalance(chainId, cantoAddress, "acanto");
}

/**
 * @notice gets token balance from cosmos chain
 * @param {string | number} chainId chainId to get balances from
 * @param {string} cosmosAddress cosmos address to get balance for
 * @param {string} tokenDenom token denom to get balance for
 * @returns {PromiseWithError<string>} balance of token as a string or error
 */
export async function getCosmosTokenBalance(
  chainId: string | number,
  cosmosAddress: string,
  tokenDenom: string
): PromiseWithError<string> {
  const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(chainId);
  if (urlError) {
    return NEW_ERROR("getCosmosTokenBalance", urlError);
  }
  const { data: result, error: balanceError } = await tryFetch<{
    balance: { amount: string };
  }>(
    nodeURL +
      "/cosmos/bank/v1beta1/balances/" +
      cosmosAddress +
      "/by_denom?denom=" +
      tokenDenom
  );
  if (balanceError) {
    return NEW_ERROR("getCosmosTokenBalance", balanceError);
  }
  return NO_ERROR(result.balance.amount);
}

/**
 * @notice gets all token balances from cosmos chain
 * @param {string} chainId chainId to get balances from
 * @param {string} cosmosAddress cosmos address to get balances for
 * @returns {PromiseWithError<UserTokenBalances>} balances of all tokens as a string or error
 */
export async function getCosmosTokenBalanceList(
  chainId: string,
  cosmosAddress: string
): PromiseWithError<UserTokenBalances> {
  try {
    // check to make sure address matches chain
    const { data: cosmosChain, error: chainError } =
      getNetworkInfoFromChainId(chainId);
    if (chainError) throw chainError;

    if (!isCosmosNetwork(cosmosChain))
      throw Error("Invalid chainId for cosmos: " + chainId);

    if (!cosmosChain.checkAddress(cosmosAddress))
      throw Error("Invalid address for chain: " + cosmosAddress);

    // can look for balances of this address now
    const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(chainId);
    if (urlError) throw urlError;

    const { data: result, error: balanceError } = await tryFetch<{
      balances: { amount: string; denom: string }[];
    }>(nodeURL + "/cosmos/bank/v1beta1/balances/" + cosmosAddress);
    if (balanceError) throw balanceError;

    const balances: UserTokenBalances = {};
    result.balances.forEach((balance) => {
      balances[balance.denom] = balance.amount;
    });
    return NO_ERROR(balances);
  } catch (err) {
    return NEW_ERROR("getCosmosTokenBalanceList", err);
  }
}
