import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "../async.utils";
import { getCosmosAPIEndpoint } from "../networks.utils";

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
