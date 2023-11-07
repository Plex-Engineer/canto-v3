import { ERC20Token, UserTokenBalances } from "@/config/interfaces";
import { useState } from "react";
import { getEVMTokenBalanceList } from "@/utils/tokens";
import { getCosmosTokenBalanceList } from "@/utils/cosmos";
import { useQuery } from "react-query";

/**
 * @notice hook to get an object of token balances for a given address and available tokens
 * @dev will return a mappping of token id => balance
 * @param {number | string | undefined} chainId chainId to get balances for
 * @param {ERC20Token[]} tokens list of tokens to get balances for
 * @param {string | null} userEthAddress eth address to get balances for
 * @param {string | null} userCosmosAddress cosmos address to get balances for
 * @param {object} options options for the query
 * @returns {UserTokenBalances} object of token balances
 */
export default function useTokenBalances(
  chainId: number | string | undefined,
  tokens: ERC20Token[],
  userEthAddress: string | null = null,
  userCosmosAddress: string | null = null,
  options?: {
    refetchInterval?: number;
  }
): UserTokenBalances {
  // state for balances of tokens
  const [userTokenBalances, setUserTokenBalances] = useState<UserTokenBalances>(
    {}
  );

  async function getTokenBalances(): Promise<UserTokenBalances> {
    // only set balances if there is a user and the chain is an evm chain
    if (typeof chainId === "number" && userEthAddress) {
      const { data: balances, error: balancesError } =
        await getEVMTokenBalanceList(chainId, tokens, userEthAddress);
      if (balancesError) {
        throw "useTokenBalances::getTokenBalances::" + balancesError.message;
      }
      return balances;
    } else if (typeof chainId === "string" && userCosmosAddress) {
      const { data: balances, error: balancesError } =
        await getCosmosTokenBalanceList(chainId, userCosmosAddress);
      if (balancesError) {
        throw "useTokenBalances::getTokenBalances::" + balancesError.message;
      }
      return balances;
    } else {
      return {};
    }
  }
  useQuery(
    ["tokenBalances", { chainId, tokens, userEthAddress, userCosmosAddress }],
    async (): Promise<UserTokenBalances> => {
      return await getTokenBalances();
    },
    {
      onSuccess(data) {
        setUserTokenBalances(data);
      },
      onError(error) {
        console.log(error);
        setUserTokenBalances({});
      },
      refetchInterval: options?.refetchInterval || 5000,
    }
  );
  return userTokenBalances;
}
