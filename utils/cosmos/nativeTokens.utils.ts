import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { tryFetch } from "../async";
import { getCosmosAPIEndpoint } from "../networks";
import { getCosmosTokenBalanceList } from "./cosmosBalance.utils";

interface UserNativeTokensWithIBCPath {
  token: {
    denom: string;
    amount: string;
  };
  ibcPath: {
    path: string;
    base_denom: string;
  } | null;
}

/**
 * @notice gets all native token balances from cosmos chain with its denom trace
 * @dev used for identifying unknown ibc tokens
 * @param {string} chainId chainId to get balances from
 * @param {string} cosmosAddress cosmos address to get balances for
 */
export async function getUserNativeTokenBalancesWithDenomTraces(
  chainId: string,
  cosmosAddress: string
): PromiseWithError<UserNativeTokensWithIBCPath[]> {
  const { data: allTokens, error: tokenError } =
    await getCosmosTokenBalanceList(chainId, cosmosAddress);
  if (tokenError) {
    return NEW_ERROR("getUserNativeTokenBalancesWithDenomTraces", tokenError);
  }
  const userTokenList: UserNativeTokensWithIBCPath[] = [];
  await Promise.all(
    Object.entries(allTokens).map(async ([denom, amount]) => {
      if (denom.startsWith("ibc/")) {
        const { data: ibcPath, error: ibcPathError } =
          await getIBCPathAndDenomFromNativeDenom(
            chainId,
            denom.replace("ibc/", "")
          );
        userTokenList.push({ token: { denom, amount }, ibcPath });
      } else {
        userTokenList.push({ token: { denom, amount }, ibcPath: null });
      }
    })
  );
  return NO_ERROR(userTokenList);
}
// path will have the channels the token has gone through (ex. "transfer/channel-x/transfer/channel-y/...")
interface IBCDenomTrace {
  denom_trace: {
    path: string;
    base_denom: string;
  };
}
// @dev: denom without "ibc/" prefix
/**
 * @notice gets ibc path and denom from native denom
 * @dev denom without "ibc/" prefix
 * @param {string} chainId chainId to get path from
 * @param {string} denom denom to get ibc path for
 */
async function getIBCPathAndDenomFromNativeDenom(
  chainId: string,
  denom: string
): PromiseWithError<any> {
  const { data: nodeUrl, error: nodeError } = getCosmosAPIEndpoint(chainId);
  if (nodeError) {
    return NEW_ERROR("getAllNativeTokenBalances", nodeError);
  }
  const { data: result, error: fetchError } = await tryFetch<IBCDenomTrace>(
    `${nodeUrl}/ibc/apps/transfer/v1/denom_traces/${denom}`
  );
  if (fetchError) {
    return NEW_ERROR("getAllNativeTokenBalances", fetchError);
  }
  return NO_ERROR(result.denom_trace);
}
