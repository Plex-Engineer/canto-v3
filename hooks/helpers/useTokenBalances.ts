///
/// Hook to get an object of token balances for a given address and available tokens
/// This will only work on ERC20 tokens
/// Will return a mappping of token id => balance
///

import { ERC20Token } from "@/config/interfaces/tokens";
import { UserTokenBalances } from "../bridge/interfaces/tokens";
import { useEffect, useState } from "react";
import { getEVMTokenBalanceList } from "@/utils/evm/erc20.utils";

export default function useTokenBalances(
  chainId: number | string | undefined,
  tokens: ERC20Token[],
  userEthAddress: string | undefined
): UserTokenBalances {
  // state for balances of tokens
  const [userTokenBalances, setUserTokenBalances] = useState<UserTokenBalances>(
    {}
  );
  useEffect(() => {
    async function setTokenBalances(): Promise<void> {
      // only set balances if there is a user and the chain is an evm chain
      if (typeof chainId === "number" && userEthAddress) {
        const { data: balances, error: balancesError } =
          await getEVMTokenBalanceList(chainId, tokens, userEthAddress);
        if (balancesError) {
          throw new Error(
            "useTokenBalances::setTokenBalances::" + balancesError.message
          );
        }
        setUserTokenBalances(balances);
      } else {
        // remove balance object
        setUserTokenBalances({});
      }
    }
    setTokenBalances();
  }, [chainId, tokens, userEthAddress]);

  return userTokenBalances;
}
