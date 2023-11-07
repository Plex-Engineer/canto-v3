import { ERC20Token } from "@/config/interfaces";
import { ZERO_ADDRESS, getCantoCoreAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address";
import { CantoDexPair } from "../interfaces/pairs";

/**
 * @notice Returns an array of unique ERC20 tokens from an array of pairs
 * @param chainId chainId to get tokens for (for wcanto check)
 * @param pairs array of pairs to get unique tokens from
 * @returns {ERC20Token[]} array of unique ERC20 tokens
 */
export function getUniqueUnderlyingTokensFromPairs(
  chainId: number,
  pairs: CantoDexPair[]
): ERC20Token[] {
  // get wcanto address to define a native token
  const wcantoAddress = getCantoCoreAddress(chainId, "wcanto");
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
