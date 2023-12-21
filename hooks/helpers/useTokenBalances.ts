import {
  ERC20Token,
  IBCToken,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  UserTokenBalances,
} from "@/config/interfaces";
import { getEVMTokenBalanceList } from "@/utils/tokens";
import { getCosmosTokenBalanceList } from "@/utils/cosmos";
import { useQuery } from "react-query";
import { getCosmosEIPChainObject } from "@/utils/networks";
import { ethToCantoAddress } from "@/utils/address";
import { addTokenBalances } from "@/utils/math";
import { ethToGravity } from "@gravity-bridge/address-converter";
import { getCosmosTokenBalance } from "@/utils/cosmos";
import { GRAVITY_BRIDGE } from "@/config/networks";

/**
 * @notice hook to get an object of token balances for a given address and available tokens
 * @dev will return a mappping of token id => balance
 * @param {number | string | undefined} chainId chainId to get balances for
 * @param {ERC20Token[]} tokens list of tokens to get balances for
 * @param {string | null} userEthAddress eth address to get balances for
 * @param {string | null} userCosmosAddress cosmos address to get balances for
 * @returns {UserTokenBalances} object of token balances
 */
export default function useTokenBalances(
  chainId: number | string | undefined,
  tokens: ERC20Token[],
  userEthAddress: string | null = null,
  userCosmosAddress: string | null = null,
  combinedCantoNative = false
): UserTokenBalances {
  const { data } = useQuery(
    [
      "tokenBalances",
      {
        chainId,
        tokens,
        userEthAddress,
        userCosmosAddress,
      },
    ],
    async (): Promise<UserTokenBalances> => {
      try {
        const { data: balances, error: balancesError } = await getTokenBalances(
          chainId,
          tokens,
          userEthAddress,
          userCosmosAddress
        );
        if (balancesError) throw balancesError;

        // check if we need to combine native balances (convert coins)
        if (combinedCantoNative && userEthAddress) {
          // get chain ids for token lookups
          const { data: chainObject, error: chainError } =
            getCosmosEIPChainObject(chainId as number);
          if (chainError) throw chainError;

          // get canto address
          const { data: cantoAddress, error: cantoAddressError } =
            await ethToCantoAddress(userEthAddress);
          if (cantoAddressError) throw cantoAddressError;

          // get native balances
          const { data: nativeBalances, error: nativeError } =
            await getCosmosTokenBalanceList(
              chainObject.cosmosChainId,
              cantoAddress
            );
          if (nativeError) throw nativeError;

          // go through token list to see if any are native compatible, (has ibcDenom)
          for (let token of tokens) {
            const ibcToken = token as IBCToken;
            if (ibcToken.ibcDenom && nativeBalances[ibcToken.ibcDenom]) {
              balances[token.id] = addTokenBalances(
                balances[token.id],
                nativeBalances[ibcToken.ibcDenom]
              );
            }
            //TODO:HOTFIX FOR USER USDC GRAVITY BALANCE
            if (token.id === "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd") {
              const gravityAddress = ethToGravity(userEthAddress);
              const usdcAddressOnGravity =
                "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
              const { data: usdcGravBalance, error } =
                await getCosmosTokenBalance(
                  GRAVITY_BRIDGE.chainId,
                  gravityAddress,
                  usdcAddressOnGravity
                );
              if (!error && usdcGravBalance) {
                balances[token.id] = addTokenBalances(
                  balances[token.id],
                  usdcGravBalance
                );
              }
            }
          }
        }
        return balances;
      } catch (err) {
        return {};
      }
    },
    {
      onError(error) {
        console.log(error);
      },
      placeholderData: {},
    }
  );
  return data ?? {};
}

async function getTokenBalances(
  chainId: string | number | undefined,
  tokens: ERC20Token[],
  userEthAddress: string | null,
  userCosmosAddress: string | null
): PromiseWithError<UserTokenBalances> {
  try {
    // only set balances if there is a user and the chain is an evm chain
    if (typeof chainId === "number" && userEthAddress) {
      const { data: balances, error: balancesError } =
        await getEVMTokenBalanceList(chainId, tokens, userEthAddress);
      if (balancesError) throw balancesError;
      return NO_ERROR(balances);
    } else if (typeof chainId === "string" && userCosmosAddress) {
      const { data: balances, error: balancesError } =
        await getCosmosTokenBalanceList(chainId, userCosmosAddress);
      if (balancesError) throw balancesError;
      return NO_ERROR(balances);
    } else {
      throw new Error("invalid chainId or user address");
    }
  } catch (err) {
    return NEW_ERROR("useTokenBalances::getTokenBalances" + err);
  }
}
