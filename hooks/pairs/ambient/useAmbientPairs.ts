import { useQuery } from "react-query";
import {
  AmbientHookInputParams,
  AmbientHookReturn,
} from "./interfaces/hookParams";
import { getGeneralAmbientPairData } from "./helpers/ambientPairData";
import { getAmbientPairsFromChainId } from "./config/ambientPairs";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "./interfaces/ambientTxTypes";
import {
  NEW_ERROR,
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import { createNewAmbientTxFlow } from "./helpers/createAmbientFlow";
import useTokenBalances from "@/hooks/helpers/useTokenBalances";
import { getUniqueUnderlyingTokensFromPairs } from "./helpers/underlyingTokens";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";
import { convertFromQ64RootPrice } from "@/utils/ambient/ambientMath.utils";
import { validateInputTokenAmount } from "@/utils/validation.utils";

export default function useAmbientPairs(
  params: AmbientHookInputParams,
  options?: {
    refetchInterval?: number;
  }
): AmbientHookReturn {
  ///
  /// INTERNAL STATE
  ///

  // use query for all ambient pair data
  const { data: ambientPairs } = useQuery(
    ["ambientPairs", params.chainId, params.userEthAddress],
    async () => {
      const pairs = getAmbientPairsFromChainId(params.chainId);
      return (
        (await getGeneralAmbientPairData(params.chainId, pairs)).data ?? []
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
    getUniqueUnderlyingTokensFromPairs(ambientPairs ?? []),
    params.userEthAddress
  );

  const pairsWithBalances = ambientPairs?.map((pair) => {
    // look for balances
    const baseBalance = underlyingTokenBalances[pair.base.address];
    const quoteBalance = underlyingTokenBalances[pair.quote.address];
    return {
      ...pair,
      base: {
        ...pair.base,
        balance: baseBalance ?? "0",
      },
      quote: {
        ...pair.quote,
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
      case AmbientTxType.ADD_CONC_LIQIDITY: {
        // check that balances are good for each token
        const base = txParams.pair.base;
        const quote = txParams.pair.quote;
        let baseAmount;
        let quoteAmount;
        if (txParams.isAmountBase) {
          baseAmount = txParams.amount;
          quoteAmount = getConcQuoteTokensFromBaseTokens(
            baseAmount,
            convertFromQ64RootPrice(txParams.pair.q64PriceRoot),
            txParams.minPrice,
            txParams.maxPrice
          );
        } else {
          quoteAmount = txParams.amount;
          baseAmount = getConcBaseTokensFromQuoteTokens(
            quoteAmount,
            convertFromQ64RootPrice(txParams.pair.q64PriceRoot),
            txParams.minPrice,
            txParams.maxPrice
          );
        }
        const baseCheck = validateInputTokenAmount(
          baseAmount,
          base.balance ?? "0",
          base.address,
          base.decimals
        );
        const quoteCheck = validateInputTokenAmount(
          quoteAmount,
          quote.balance ?? "0",
          quote.address,
          quote.decimals
        );
        const prefixError = !baseCheck.isValid ? base.symbol : quote.symbol;
        return {
          isValid: baseCheck.isValid && quoteCheck.isValid,
          errorMessage:
            prefixError + (baseCheck.errorMessage || quoteCheck.errorMessage),
        };
      }
      default:
        return {
          isValid: false,
          errorMessage: "tx type not found",
        };
    }
  }

  // tx flow creator
  function createNewPairsFlow(
    params: AmbientTransactionParams
  ): ReturnWithError<NewTransactionFlow> {
    const validation = validateTxParams(params);
    if (!validation.isValid) {
      return NEW_ERROR("createNewPairsFlow::" + validation.errorMessage);
    }
    return createNewAmbientTxFlow(params);
  }

  return {
    ambientPairs: pairsWithBalances ?? [],
    transaction: {
      validateParams: validateTxParams,
      createNewPairsFlow,
    },
  };
}
