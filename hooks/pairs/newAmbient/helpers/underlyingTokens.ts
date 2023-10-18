import { ERC20Token } from "@/config/interfaces";
import { AmbientPool } from "../interfaces/ambientPools";

export function getUniqueUnderlyingTokensFromPairs(
  pools: AmbientPool[]
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

  pools.forEach((pool) => {
    if (!uniqueAddresses.has(pool.base.address)) {
      addToken(pool.base);
      uniqueAddresses.add(pool.base.address);
    }
    if (!uniqueAddresses.has(pool.quote.address)) {
      addToken(pool.quote);
      uniqueAddresses.add(pool.quote.address);
    }
  });
  return Array.from(uniqueTokens);
}
