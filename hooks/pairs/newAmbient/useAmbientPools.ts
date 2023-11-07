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
  ValidationReturn,
} from "@/config/interfaces";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient";
import { validateInputTokenAmount } from "@/utils/math";
import { createNewAmbientTxFlow } from "./helpers/createAmbientFlow";
import { queryUserAmbientRewards } from "./helpers/ambientApi";
import { CLMClaimRewardsTxParams } from "@/hooks/lending/interfaces/lendingTxTypes";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { useEffect, useState } from "react";
import { CANTO_DATA_API_ENDPOINTS, getCantoApiData } from "@/config/api";
import { CToken } from "@/hooks/lending/interfaces/tokens";

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
      return {
        pools:
          (await getAllAmbientPoolsData(params.chainId, params.userEthAddress))
            .data ?? [],
        rewards: params.userEthAddress
          ? (
              await queryUserAmbientRewards(
                params.chainId,
                params.userEthAddress
              )
            ).data ?? "0"
          : "0",
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
  }, [ambient?.pools.length, params.chainId]);

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
  function validateTxParams(
    txParams: AmbientTransactionParams
  ): ValidationReturn {
    switch (txParams.txType) {
      case AmbientTxType.ADD_CONC_LIQUIDITY: {
        // check that balances are good for each token
        const base = txParams.pair.base;
        const quote = txParams.pair.quote;
        let baseAmount;
        let quoteAmount;
        if (txParams.isAmountBase) {
          baseAmount = txParams.amount;
          quoteAmount = getConcQuoteTokensFromBaseTokens(
            baseAmount,
            txParams.pair.stats.lastPriceSwap.toString(),
            txParams.minPriceWei,
            txParams.maxPriceWei
          );
        } else {
          quoteAmount = txParams.amount;
          baseAmount = getConcBaseTokensFromQuoteTokens(
            quoteAmount,
            txParams.pair.stats.lastPriceSwap.toString(),
            txParams.minPriceWei,
            txParams.maxPriceWei
          );
        }
        const baseCheck = validateInputTokenAmount(
          baseAmount,
          base.balance ?? "0",
          base.symbol,
          base.decimals
        );
        const quoteCheck = validateInputTokenAmount(
          quoteAmount,
          quote.balance ?? "0",
          quote.symbol,
          quote.decimals
        );
        const prefixError = !baseCheck.isValid ? base.symbol : quote.symbol;
        return {
          isValid: baseCheck.isValid && quoteCheck.isValid,
          errorMessage:
            prefixError +
            " " +
            (baseCheck.errorMessage || quoteCheck.errorMessage),
        };
      }
      case AmbientTxType.REMOVE_CONC_LIQUIDITY: {
        // get position
        const position = txParams.pair.userPositions.find(
          (pos) => pos.positionId === txParams.positionId
        );
        if (!position) {
          return {
            isValid: false,
            errorMessage: "position not found",
          };
        }
        // check enough liquidity there
        return validateInputTokenAmount(
          txParams.liquidity,
          position.concLiq.toString(),
          txParams.pair.symbol
        );
      }
      default:
        return {
          isValid: false,
          errorMessage: "tx type not found",
        };
    }
  }

  // tx flow creators
  function createNewPoolFlow(
    params: AmbientTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateTxParams(params);
    if (!validation.isValid) {
      return NEW_ERROR("createNewPoolFlow::" + validation.errorMessage);
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
