import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "../async.utils";
import {
  getCosmosAPIEndpoint,
  getCosmosChainObject,
  getNetworkInfoFromChainId,
  isCosmosNetwork,
} from "../networks.utils";
import { getCosmosTokenBalanceList } from "./cosmosBalance.utils";
import { ethToCantoAddress } from "../address.utils";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { CANTO_TESTNET_COSMOS } from "@/config/networks";
import { IBCToken } from "@/config/interfaces/tokens";

export interface RecoveryTokens {
  convert: ({ convertToken: IBCToken } & UserNativeTokensWithIBCPath)[];
  ibc: ({ ibcNetwork: any } & UserNativeTokensWithIBCPath)[];
}
/**
 * @notice gets all tokens that can be recovered from cosmos chain
 * @param {number} cantoEthChainId chainId of canto chain
 * @param {string} ethAddress eth address to get tokens for
 * @returns {PromiseWithError<RecoveryTokens>} tokens that can be recovered or error
 */
export async function getRecoveryTokenList(
  cantoEthChainId: number,
  ethAddress: string
): PromiseWithError<RecoveryTokens> {
  // convert eth props to cosmos props
  const { data: cantoAddress, error: cantoAddressError } =
    await ethToCantoAddress(ethAddress);
  if (cantoAddressError) {
    return NEW_ERROR("getRecoveryTokenList::" + cantoAddressError.message);
  }
  const { data: cosmosChainObj, error: cosmosChainObjError } =
    getCosmosChainObject(cantoEthChainId);
  if (cosmosChainObjError) {
    return NEW_ERROR("getRecoveryTokenList::" + cosmosChainObjError.message);
  }
  // get token list with ibc denoms
  const { data: nativeTokens, error: nativeTokenError } =
    await getUserNativeTokenBalancesWithDenomTraces(
      cosmosChainObj.cosmosChainId,
      cantoAddress
    );
  if (nativeTokenError) {
    return NEW_ERROR("getRecoveryTokenList::" + nativeTokenError.message);
  }

  // see if we can identify any of the tokens with the ibc denoms
  // if in the bridge out token list, then we can convert coin
  // if not, then we can't convert coin and the user will need to ibc transfer
  const bridgeOutTokens = BRIDGE_OUT_TOKENS.chainTokenList[
    cosmosChainObj.cosmosChainId === CANTO_TESTNET_COSMOS.chainId
      ? "canto-testnet"
      : "canto-mainnet"
  ] as IBCToken[];

  const availableConvertTokens: any[] = [];
  const availableIBCTokens: any[] = [];
  nativeTokens.forEach((nativeToken) => {
    const convertToken = bridgeOutTokens.find(
      (bridgeToken) => bridgeToken?.ibcDenom === nativeToken.token.denom
    );
    if (convertToken) {
      // convert tokens can also be ibc'd by default
      availableConvertTokens.push({
        ...nativeToken,
        convertToken,
      });
    } else {
      // this is an ibc token that can't be converted, so find the chain it came from
      const ibcPath = nativeToken.ibcPath?.path;
      if (!ibcPath) return;
      // get first channel in the list (string will start with "transfer/channel-x/")
      const cantoChannel = ibcPath.split("/")[1];
      // get the chainId from the channel
      Object.entries(IBC_CHANNELS).forEach(([networkId, channels]) => {
        if (channels.fromCanto === cantoChannel) {
          // we found the chainId, so we can try to get the network object
          const { data: networkObj, error: networkError } =
            getNetworkInfoFromChainId(networkId);
          if (networkError || !isCosmosNetwork(networkObj)) {
            // no network found or not ibc network, so skip
            return;
          }
          availableIBCTokens.push({ ...nativeToken, ibcNetwork: networkObj });
        }
      });
    }
  });

  return NO_ERROR({ convert: availableConvertTokens, ibc: availableIBCTokens });
}

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
async function getUserNativeTokenBalancesWithDenomTraces(
  chainId: string,
  cosmosAddress: string
): PromiseWithError<UserNativeTokensWithIBCPath[]> {
  const { data: allTokens, error: tokenError } =
    await getCosmosTokenBalanceList(chainId, cosmosAddress);
  if (tokenError) {
    return NEW_ERROR(
      "getUserNativeTokenBalancesWithDenomTraces::" + tokenError.message
    );
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
