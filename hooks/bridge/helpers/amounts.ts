import { BridgeToken } from "../interfaces/tokens";
import { isOFTToken } from "@/utils/tokens";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import BigNumber from "bignumber.js";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { estimateOFTSendGasFee } from "@/transactions/bridge/layerZero/helpers";

/**
 * Returns the maximum amount of tokens that can be bridged
 * @param {BridgeToken} token the token to bridge
 * @param {string} toNetworkId the network id of the network to bridge to
 * @returns {string} the maximum amount of tokens that can be bridged
 */
export async function maxBridgeAmountInUnderlying(
  token: BridgeToken | null,
  toNetworkId: string
): Promise<string> {
  // return "0" if there is no token or balance
  if (!token || !token.balance) return "0";
  // if the token is not a native token, return the balance
  if (!token.nativeWrappedToken) return token.balance;
  // since the token is a native token, leave room for gas
  if (isOFTToken(token)) {
    // get OFT gas estimation for sending to the other network
    const toLZChainId = LZ_CHAIN_IDS[toNetworkId as keyof typeof LZ_CHAIN_IDS];
    if (!toLZChainId) return "0";
    const { data: gas, error: gasError } = await estimateOFTSendGasFee(
      token.chainId,
      toLZChainId,
      token.address,
      ZERO_ADDRESS,
      token.balance,
      [1, 200000]
    );
    if (gasError) return "0";
    return BigNumber(token.balance).minus(gas).toString();
  }
  return token.balance;
}
