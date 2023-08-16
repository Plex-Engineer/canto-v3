import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "../async.utils";

interface UserNativeTokensWithIBCPath {
  token: NativeTokenBalance;
  ibcPath: {
    path: string;
    base_denom: string;
  };
}
export async function getUserNativeTokenBalancesWithDenomTraces(
  chainId: number,
  cantoAddress: string
): PromiseWithError<UserNativeTokensWithIBCPath[]> {
  const { data: allTokens, error: tokenError } =
    await getAllNativeTokenBalances(chainId, cantoAddress);
  if (tokenError) {
    return NEW_ERROR(
      "getUserNativeTokenBalancesWithDenomTraces::" + tokenError.message
    );
  }
  const userTokenList: UserNativeTokensWithIBCPath[] = [];
  await Promise.all(
    allTokens.map(async (token) => {
      if (token.denom.startsWith("ibc/")) {
        const { data: ibcPath } = await getIBCPathAndDenomFromNativeDenom(
          chainId,
          token.denom.replace("ibc/", "")
        );
        userTokenList.push({ token, ibcPath });
      }
    })
  );
  return NO_ERROR(userTokenList);
}

interface NativeTokenBalance {
  denom: string;
  amount: string;
}
async function getAllNativeTokenBalances(
  chainId: number,
  cantoAddress: string
): PromiseWithError<NativeTokenBalance[]> {
  const { data: nodeUrl, error: nodeError } = getCosmosAPIEndpoint(chainId);
  if (nodeError) {
    return NEW_ERROR("getAllNativeTokenBalances: " + nodeError.message);
  }
  const { data: result, error: fetchError } = await tryFetch<{
    balances: NativeTokenBalance[];
  }>(`${nodeUrl}/cosmos/bank/v1beta1/balances/${cantoAddress}`);

  if (fetchError) {
    return NEW_ERROR("getAllNativeTokenBalances: " + fetchError.message);
  }
  return NO_ERROR(result.balances);
}

// path will have the channels the token has gone through (ex. "transfer/channel-x/transfer/channel-y/...")
interface IBCDenomTrace {
  denom_trace: {
    path: string;
    base_denom: string;
  };
}
// @dev: denom without "ibc/" prefix
async function getIBCPathAndDenomFromNativeDenom(
  chainId: number,
  denom: string
): PromiseWithError<any> {
  const { data: nodeUrl, error: nodeError } = getCosmosAPIEndpoint(chainId);
  if (nodeError) {
    return NEW_ERROR("getAllNativeTokenBalances: " + nodeError.message);
  }
  const { data: result, error: fetchError } = await tryFetch<IBCDenomTrace>(
    `${nodeUrl}/ibc/apps/transfer/v1/denom_traces/${denom}`
  );
  if (fetchError) {
    return NEW_ERROR("getAllNativeTokenBalances: " + fetchError.message);
  }
  return NO_ERROR(result.denom_trace);
}
