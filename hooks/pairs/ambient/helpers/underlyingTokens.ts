import { ERC20Token } from "@/config/interfaces";
import { AmbientPair } from "../interfaces/ambientPairs";

export function getUniqueUnderlyingTokensFromPairs(
  pairs: AmbientPair[]
): ERC20Token[] {
  // look for unique addresses and add tokens to set
  const uniqueAddresses = new Set<string>();
  const uniqueTokens = new Set<ERC20Token>();

  function addToken(token: any) {
    uniqueTokens.add({
      ...token,
      id: token.address,
      icon: token.logoURI,
      address: token.address,
    });
    uniqueAddresses.add(token.address);
  }

  pairs.forEach((pair) => {
    if (!uniqueAddresses.has(pair.base.address)) {
      addToken(pair.base);
      uniqueAddresses.add(pair.base.address);
    }
    if (!uniqueAddresses.has(pair.quote.address)) {
      addToken(pair.quote);
      uniqueAddresses.add(pair.quote.address);
    }
  });
  return Array.from(uniqueTokens);
}
