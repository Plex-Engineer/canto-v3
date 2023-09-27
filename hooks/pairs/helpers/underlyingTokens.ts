import { ERC20Token } from "@/config/interfaces";
import { PairWithUserCTokenData } from "../interfaces/pairs";
import { ZERO_ADDRESS, getCLMAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address.utils";

/**
 * @notice Returns an array of unique ERC20 tokens from an array of pairs
 * @param chainId chainId to get tokens for (for wcanto check)
 * @param pairs array of pairs to get unique tokens from
 * @returns {ERC20Token[]} array of unique ERC20 tokens
 */
export function getUniqueUnderlyingTokensFromPairs(
  chainId: number,
  pairs: PairWithUserCTokenData[]
): ERC20Token[] {
  // get wcanto address to define a native token
  const wcantoAddress = getCLMAddress(chainId, "wcanto");
  const uniqueAddresses = new Set<string>();
  const uniqueTokens = new Set<ERC20Token>();

  function addToken(token: any) {
    const isWcanto = areEqualAddresses(token.address, wcantoAddress ?? "");
    uniqueTokens.add({
      ...token,
      id: token.address,
      icon: token.logoURI,
      nativeWrappedToken: isWcanto,
      address: isWcanto ? ZERO_ADDRESS : token.address,
    });
    uniqueAddresses.add(token.address);
  }

  pairs.forEach((pair) => {
    if (!uniqueAddresses.has(pair.token1.address)) {
      addToken(pair.token1);
      uniqueAddresses.add(pair.token1.address);
    }
    if (!uniqueAddresses.has(pair.token2.address)) {
      addToken(pair.token2);
      uniqueAddresses.add(pair.token2.address);
    }
  });
  return Array.from(uniqueTokens);
}
