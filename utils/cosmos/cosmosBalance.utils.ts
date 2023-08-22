import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "../async.utils";
import {
  getCosmosAPIEndpoint,
  getNetworkInfoFromChainId,
} from "../networks.utils";
import { IBCToken, UserTokenBalances } from "@/hooks/bridge/interfaces/tokens";
import { CosmosNetwork } from "@/config/interfaces/networks";

export async function getCantoBalance(
  chainId: string,
  cantoAddress: string
): PromiseWithError<string> {
  const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(chainId);
  if (urlError) {
    return NEW_ERROR("getCantoBalance::" + urlError.message);
  }
  const { data: result, error: balanceError } = await tryFetch<{
    balance: { amount: string };
  }>(
    nodeURL +
      "/cosmos/bank/v1beta1/balances/" +
      cantoAddress +
      "/by_denom?denom=acanto"
  );
  if (balanceError) {
    return NEW_ERROR("getCantoBalance::" + balanceError.message);
  }
  return NO_ERROR(result.balance.amount);
}

export async function getCosmosTokenBalanceList(
  chainId: string,
  cosmosAddress: string
): PromiseWithError<UserTokenBalances> {
  // check to make sure address matches chain
  const { data: cosmosChain, error: chainError } =
    getNetworkInfoFromChainId(chainId);
  if (chainError) {
    return NEW_ERROR("getCosmosTokenBalanceList::" + chainError.message);
  }
  if (
    (cosmosChain as CosmosNetwork).checkAddress &&
    !(cosmosChain as CosmosNetwork).checkAddress(cosmosAddress)
  ) {
    return NEW_ERROR(
      "getCosmosTokenBalanceList::Invalid address for chain: " + cosmosAddress
    );
  }
  // can look for balances of this address now
  const { data: nodeURL, error: urlError } = getCosmosAPIEndpoint(chainId);
  if (urlError) {
    return NEW_ERROR("getCosmosTokenBalanceList::" + urlError.message);
  }
  const { data: result, error: balanceError } = await tryFetch<{
    balances: { amount: string; denom: string }[];
  }>(nodeURL + "/cosmos/bank/v1beta1/balances/" + cosmosAddress);
  if (balanceError) {
    return NEW_ERROR("getCosmosTokenBalanceList::" + balanceError.message);
  }
  console.log(result);
  const balances: UserTokenBalances = {};
  result.balances.forEach((balance) => {
    balances[balance.denom] = balance.amount;
  });
  return NO_ERROR(balances);
}
