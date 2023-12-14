import { useQuery } from "react-query";
import {
  AmbientHookInputParams,
  AmbientHookReturn,
} from "./interfaces/hookParams";
import { AmbientPool } from "./interfaces/ambientPools";
import { getAllAmbientPoolsData } from "./helpers/getAmbientPoolsData";
import useTokenBalances from "@/hooks/helpers/useTokenBalances";
import { getUniqueUnderlyingTokensFromPairs } from "./helpers/underlyingTokens";
import { queryUserAmbientRewards } from "./helpers/ambientApi";
import { useEffect, useState } from "react";
import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import { CToken } from "@/hooks/lending/interfaces/tokens";
import {
  newAmbientClaimRewardsTxFlow,
  newAmbientLPTxFlow,
  validateAmbientLiquidityTxParams,
} from "@/transactions/pairs/ambient";

export default function useAmbientPools(
  params: AmbientHookInputParams
): AmbientHookReturn {
  ///
  /// INTERNAL STATE
  ///

  // use query for all ambient pool data
  const { data: ambient, isLoading } = useQuery(
    ["ambient pools", params.chainId, params.userEthAddress],
    async (): Promise<{ pools: AmbientPool[]; rewards: string }> => {
      const pools = await getAllAmbientPoolsData(
        params.chainId,
        params.userEthAddress
      );
      if (pools.error) throw pools.error;
      let rewards = "0";
      if (params.userEthAddress) {
        const rewardsQuery = await queryUserAmbientRewards(
          params.chainId,
          params.userEthAddress
        );
        if (rewardsQuery.error) throw rewardsQuery.error;
        rewards = rewardsQuery.data;
      }
      return {
        pools: pools.data,
        rewards,
      };
    },
    {
      onError: (error) => {
        console.log(error);
      },
    }
  );

  // some ambient tokens may have underlying apr from the lending market, so we need to get those
  // do not need to use entire cTokens array, just the ones that are in the ambient pools
  type AprMap = {
    [key: string]: {
      distApr: string;
      supplyApr: string;
    };
  };
  const [ambientTokenAprs, setAmbientTokenAprs] = useState<AprMap>({});
  // only run this once whenever pool length changes
  useEffect(() => {
    async function getCTokenAprs() {
      if (!ambient?.pools.length) {
        setAmbientTokenAprs({});
        return;
      }
      const aprMap: AprMap = {};
      const cTokenAddresses: string[] = [];
      for (const pool of ambient?.pools ?? []) {
        if (pool.base.isCToken) {
          cTokenAddresses.push(pool.base.address);
        }
        if (pool.quote.isCToken) {
          cTokenAddresses.push(pool.quote.address);
        }
      }
      const cTokenData = await Promise.all(
        cTokenAddresses.map((cTokenAddress) =>
          getCantoApiData<CToken>(
            params.chainId,
            CANTO_DATA_API_ENDPOINTS.singleCToken(cTokenAddress)
          )
        )
      );
      for (const cToken of cTokenData) {
        if (cToken.error) {
          console.log(cToken.error);
          continue;
        }
        aprMap[cToken.data.address] = {
          distApr: (Number(cToken.data.distApy) / 2).toString(),
          supplyApr: (Number(cToken.data.supplyApy) / 2).toString(),
        };
      }
      setAmbientTokenAprs(aprMap);
    }
    getCTokenAprs();
  }, [ambient?.pools, params.chainId]);

  // get balances of all underlying tokens
  const underlyingTokenBalances = useTokenBalances(
    params.chainId,
    getUniqueUnderlyingTokensFromPairs(ambient?.pools ?? []),
    params.userEthAddress
  );

  const poolsWithBalances: AmbientPool[] =
    ambient?.pools?.map((pool) => {
      // look for balances
      const baseBalance = underlyingTokenBalances[pool.base.address];
      const quoteBalance = underlyingTokenBalances[pool.quote.address];
      // look for aprs
      const baseAprs = ambientTokenAprs[pool.base.address];
      const quoteAprs = ambientTokenAprs[pool.quote.address];
      const aprObj = {
        poolApr: pool.totals.apr.poolApr,
        base: !baseAprs
          ? undefined
          : {
              dist: baseAprs.distApr,
              supply: baseAprs.supplyApr,
            },
        quote: !quoteAprs
          ? undefined
          : {
              dist: quoteAprs.distApr,
              supply: quoteAprs.supplyApr,
            },
      };
      return {
        ...pool,
        base: {
          ...pool.base,
          balance: baseBalance ?? "0",
        },
        quote: {
          ...pool.quote,
          balance: quoteBalance ?? "0",
        },
        totals: {
          ...pool.totals,
          apr: aprObj,
        },
      };
    }) ?? [];

  return {
    isLoading,
    rewards: ambient?.rewards ?? "0",
    ambientPools: poolsWithBalances,
    transaction: {
      validateParams: (txParams) => validateAmbientLiquidityTxParams(txParams),
      newAmbientPoolTxFlow: (txParams) => newAmbientLPTxFlow(txParams),
      newAmbientClaimRewardsFlow: (txParams) =>
        newAmbientClaimRewardsTxFlow(txParams),
    },
  };
}
