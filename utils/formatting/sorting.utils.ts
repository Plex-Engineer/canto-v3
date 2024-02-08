import { greaterThan } from "../math";

type BaseToken = {
  symbol: string;
  decimals: number;
  balance?: string;
};
/**
 * Sorts tokens by balance, then symbol
 * @param tokens array of tokens to sort
 * @returns sorted tokens
 */
export function sortTokens<T extends BaseToken>(tokens: T[]): T[] {
  return tokens.sort((a, b) => {
    // if neither token has a balance, sort by symbol
    if (
      (!a.balance || a.balance === "0") &&
      (!b.balance || b.balance === "0")
    ) {
      return a.symbol.localeCompare(b.symbol);
    }
    // sort by balance
    return greaterThan(
      a.balance || "0",
      b.balance || "0",
      a.decimals,
      b.decimals
    )
      ? -1
      : 1;
  });
}
