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
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";
import { validateInputTokenAmount } from "@/utils/validation.utils";
import { createNewAmbientTxFlow } from "./helpers/createAmbientFlow";

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
  const { data: allPools, isLoading } = useQuery(
    ["ambient pools", params.chainId, params.userEthAddress],
    async (): Promise<AmbientPool[]> => {
      return (
        (await getAllAmbientPoolsData(params.chainId, params.userEthAddress))
          .data ?? []
      );
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

  // get balances of all underlying tokens
  const underlyingTokenBalances = useTokenBalances(
    params.chainId,
    getUniqueUnderlyingTokensFromPairs(allPools ?? []),
    params.userEthAddress
  );

  const poolsWithBalances = allPools?.map((pool) => {
    // look for balances
    const baseBalance = underlyingTokenBalances[pool.base.address];
    const quoteBalance = underlyingTokenBalances[pool.quote.address];
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
    };
  });

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
            txParams.pair.stats.lastPriceLiq.toString(),
            txParams.minPriceWei,
            txParams.maxPriceWei
          );
        } else {
          quoteAmount = txParams.amount;
          baseAmount = getConcBaseTokensFromQuoteTokens(
            quoteAmount,
            txParams.pair.stats.lastPriceLiq.toString(),
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

  // tx flow creator
  function createNewPoolFlow(
    params: AmbientTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateTxParams(params);
    if (!validation.isValid) {
      return NEW_ERROR("createNewPoolFlow::" + validation.errorMessage);
    }
    return createNewAmbientTxFlow(params);
  }

  return {
    isLoading,
    ambientPools: poolsWithBalances ?? [],
    transaction: {
      validateParams: validateTxParams,
      createNewPoolFlow,
    },
  };
}
