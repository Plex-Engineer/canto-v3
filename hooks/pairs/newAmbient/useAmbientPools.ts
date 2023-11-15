import { useQuery } from "react-query";
import {
  AmbientHookInputParams,
  AmbientHookReturn,
} from "./interfaces/hookParams";
import { AmbientPool } from "./interfaces/ambientPools";
import { getAllAmbientPoolsData } from "./helpers/getAmbientPoolsData";
import useTokenBalances from "@/hooks/helpers/useTokenBalances";
import { getUniqueUnderlyingTokensFromPairs } from "./helpers/underlyingTokens";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "./interfaces/ambientPoolTxTypes";
import {
  NEW_ERROR,
  NO_ERROR,
  NewTransactionFlow,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { createNewAmbientTxFlow } from "./helpers/createAmbientFlow";
import { queryUserAmbientRewards } from "./helpers/ambientApi";
import { CLMClaimRewardsTxParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { useEffect, useState } from "react";
import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import { CToken } from "@/hooks/lending/interfaces/tokens";
import { USER_INPUT_ERRORS } from "@/config/consts/errors";

export default function useAmbientPools(
  params: AmbientHookInputParams,
  options?: {
    refetchInterval?: number;
  }
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
      onSuccess: (response) => {
        // console.log(response);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: options?.refetchInterval || 5000,
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

  ///
  /// EXTERNAL FUNCTIONS
  ///

  // transaction validation
  function validateTxParams(txParams: AmbientTransactionParams): Validation {
    switch (txParams.txType) {
      case AmbientTxType.ADD_CONC_LIQUIDITY: {
        // check that balances are good for each token
        const base = txParams.pool.base;
        const quote = txParams.pool.quote;
        let baseAmount;
        let quoteAmount;
        if (txParams.isAmountBase) {
          baseAmount = txParams.amount;
          quoteAmount = getConcQuoteTokensFromBaseTokens(
            baseAmount,
            txParams.pool.stats.lastPriceSwap.toString(),
            txParams.minPriceWei,
            txParams.maxPriceWei
          );
        } else {
          quoteAmount = txParams.amount;
          baseAmount = getConcBaseTokensFromQuoteTokens(
            quoteAmount,
            txParams.pool.stats.lastPriceSwap.toString(),
            txParams.minPriceWei,
            txParams.maxPriceWei
          );
        }
        const baseCheck = validateWeiUserInputTokenAmount(
          baseAmount,
          "0",
          base.balance ?? "0",
          base.symbol,
          base.decimals
        );
        if (baseCheck.error) return baseCheck;
        const quoteCheck = validateWeiUserInputTokenAmount(
          quoteAmount,
          "0",
          quote.balance ?? "0",
          quote.symbol,
          quote.decimals
        );
        return quoteCheck;
      }
      case AmbientTxType.REMOVE_CONC_LIQUIDITY: {
        // get position
        const position = txParams.pool.userPositions.find(
          (pos) => pos.positionId === txParams.positionId
        );
        if (!position) {
          return {
            error: true,
            reason: USER_INPUT_ERRORS.PROP_UNAVAILABLE("Position"),
          };
        }
        // check enough liquidity there
        return validateWeiUserInputTokenAmount(
          txParams.liquidity,
          "0",
          position.concLiq.toString(),
          txParams.pool.symbol,
          0
        );
      }
      default:
        return {
          error: true,
          reason: "tx type not found",
        };
    }
  }

  // tx flow creators
  function createNewPoolFlow(
    params: AmbientTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateTxParams(params);
    if (validation.error) {
      return NEW_ERROR("createNewPoolFlow::" + validation.reason);
    }
    return createNewAmbientTxFlow(params);
  }

  function createNewClaimRewardsFlow(
    params: CLMClaimRewardsTxParams
  ): ReturnWithError<NewTransactionFlow> {
    return NO_ERROR({
      title: "Claim Rewards",
      icon: "/icons/canto.svg",
      txType: TransactionFlowType.CLAIM_LP_REWARDS_TX,
      params: {
        ambientParams: params,
      },
    });
  }

  return {
    isLoading,
    rewards: ambient?.rewards ?? "0",
    ambientPools: poolsWithBalances,
    transaction: {
      validateParams: validateTxParams,
      createNewPoolFlow,
      createNewClaimRewardsFlow,
    },
  };
}
