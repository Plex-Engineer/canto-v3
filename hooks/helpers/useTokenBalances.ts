import { ERC20Token } from "@/config/interfaces/tokens";
import { UserTokenBalances } from "../bridge/interfaces/tokens";
import React, { useEffect, useRef, useState } from "react";
import { getEVMTokenBalanceList } from "@/utils/evm/erc20.utils";
import { getCosmosTokenBalanceList } from "@/utils/cosmos/cosmosBalance.utils";

/**
 * @notice hook to get an object of token balances for a given address and available tokens
 * @dev will return a mappping of token id => balance
 * @param {number | string | undefined} chainId chainId to get balances for
 * @param {ERC20Token[]} tokens list of tokens to get balances for
 * @param {string | undefined} userEthAddress eth address to get balances for
 * @param {string | undefined} userCosmosAddress cosmos address to get balances for
 * @returns {UserTokenBalances} object of token balances
 */
export default function useTokenBalances(
  chainId: number | string | undefined,
  tokens: ERC20Token[],
  userEthAddress: string | undefined,
  userCosmosAddress: string | undefined
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
          setUserTokenBalances({});
          console.log(
            "useTokenBalances::setTokenBalances::" + balancesError.message
          );
          return;
        }
        setUserTokenBalances(balances);
      } else if (typeof chainId === "string" && userCosmosAddress) {
        const { data: balances, error: balancesError } =
          await getCosmosTokenBalanceList(chainId, userCosmosAddress);
        if (balancesError) {
          setUserTokenBalances({});
          console.log(
            "useTokenBalances::setTokenBalances::" + balancesError.message
          );
          return;
        }
        setUserTokenBalances(balances);
      } else {
        // remove balance object
        setUserTokenBalances({});
      }
    }
    // timeout will act as debounce, if multiple deps are changed at the same time
    // interval will call every 5 seconds to update balances
    let timer: any;
    const setAllBalances = setTimeout(async () => {
      timer = setInterval(async () => await setTokenBalances(), 5000);
    }, 1000);
    return () => {
      clearTimeout(setAllBalances);
      clearInterval(timer);
    };
  }, [chainId, tokens, userEthAddress, userCosmosAddress]);

  return userTokenBalances;
}
