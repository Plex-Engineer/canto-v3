import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import { Validation } from "@/config/interfaces";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { getCTokensFromType } from "@/hooks/lending/config/cTokenAddresses";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import useLending from "@/hooks/lending/useLending";
import { CTokenLendingTxTypes } from "@/transactions/lending";
import { listIncludesAddress } from "@/utils/address";
import { getCirculatingCNote, getCirculatingNote } from "@/utils/clm";
import { addTokenBalances, convertTokenAmountToNote } from "@/utils/math";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";

interface LendingComboReturn {
  cTokens: {
    cNote: CTokenWithUserData | undefined;
    rwas: CTokenWithUserData[];
    stableCoins: CTokenWithUserData[];
  };
  isLoading: boolean;
  clmPosition: {
    position: UserLMPosition;
    general: {
      maxAccountLiquidity: string;
      outstandingDebt: string;
      percentLimitUsed: string;
      netApr: string;
    };
  };
  transaction: {
    performTx: (
      amount: string,
      txType: CTokenLendingTxTypes,
      max: boolean
    ) => void;
    validateParams: (
      amount: string,
      txType: CTokenLendingTxTypes,
      max: boolean
    ) => Validation;
  };
  selection: {
    selectedCToken: CTokenWithUserData | undefined;
    setSelectedCToken: (address: string | null) => void;
  };
  lendingStats: {
    circulatingCNote: string;
    circulatingNote: string;
    valueOfAllRWA: string;
    cNotePrice: string;
  };
}

interface LendingComboProps {
  onSuccessTx?: () => void;
}
export function useLendingCombo(props: LendingComboProps): LendingComboReturn {
  // params for useLending hook
  const { chainId, signer, txStore } = useCantoSigner();
  const { cTokens, position, isLoading, transaction, selection } = useLending({
    chainId,
    lmType: "lending",
    userEthAddress: signer?.account.address,
  });

  // sorted tokens
  const cNoteAddress = getCTokensFromType(chainId, "cNote");
  const cNote = cTokens.find((cToken) => cToken.address === cNoteAddress);

  const rwaAddressList = getCTokensFromType(chainId, "rwas");
  const rwas = cTokens.filter((cToken) =>
    listIncludesAddress(rwaAddressList ?? [], cToken.address)
  );

  const stableCoinAddressList = getCTokensFromType(chainId, "stableCoins");
  const stableCoins = cTokens.filter((cToken) =>
    listIncludesAddress(stableCoinAddressList ?? [], cToken.address)
  );

  // relevant user position data to show in UI
  const maxAccountLiquidity = addTokenBalances(
    position.totalBorrow,
    position.liquidity
  );
  const outstandingDebt = position.totalBorrow;
  const percentLimitUsed =
    Number(maxAccountLiquidity) === 0
      ? "0"
      : new BigNumber(position.totalBorrow)
          .dividedBy(maxAccountLiquidity)
          .multipliedBy(100)
          .toFixed(2);
  const netApr = new BigNumber(position.avgApr).toFixed(2);

  // lending stats (only need to call on page load, no need to update)
  const valueOfAllRWA = useMemo(() => {
    const bnValueOfAllRWA = rwas.reduce((acc, rwa) => {
      const { data: addedSupply, error } = convertTokenAmountToNote(
        rwa.underlyingTotalSupply,
        rwa.price
      );
      if (error) return acc;
      return acc.plus(addedSupply);
    }, new BigNumber(0));
    return bnValueOfAllRWA.toString();
  }, [rwas]);
  // circulating note
  const [circulatingNote, setCirculatingNote] = useState("0");
  const [circulatingCNote, setCirculatingCNote] = useState("0");
  useEffect(() => {
    async function getStats() {
      if (cNote?.underlying.address) {
        const [circulatingNote, circulatingCNote] = await Promise.all([
          getCirculatingNote(chainId, cNote.underlying.address),
          getCirculatingCNote(chainId, cNote.address),
        ]);
        if (circulatingNote.error || circulatingCNote.error) {
          console.log(circulatingNote.error ?? circulatingCNote.error);
          return;
        }
        setCirculatingNote(circulatingNote.data);
        setCirculatingCNote(circulatingCNote.data);
      }
    }
    getStats();
  }, [chainId, cNote?.underlying.address]);

  // transaction functions
  function lendingTx(
    amount: string,
    txType: CTokenLendingTxTypes,
    max: boolean
  ) {
    if (!selection.selectedCToken || !signer) return;
    const txFlow = transaction.newLendingFlow({
      chainId: chainId,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
      max,
      userPosition: position,
    });
    txStore?.addNewFlow({
      txFlow,
      signer,
      onSuccessCallback: props.onSuccessTx,
    });
  }
  const validateParams = (
    amount: string,
    txType: CTokenLendingTxTypes,
    max: boolean
  ): Validation => {
    if (!selection.selectedCToken || !signer)
      return { error: true, reason: TX_PARAM_ERRORS.PARAM_MISSING("Signer") };
    return transaction.validateParams({
      chainId: chainId,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
      max,
      userPosition: position,
    });
  };

  return {
    cTokens: {
      cNote,
      rwas,
      stableCoins,
    },
    isLoading,
    clmPosition: {
      position,
      general: {
        maxAccountLiquidity,
        outstandingDebt,
        percentLimitUsed,
        netApr,
      },
    },
    transaction: {
      performTx: lendingTx,
      validateParams,
    },
    selection,
    lendingStats: {
      circulatingCNote: circulatingCNote,
      circulatingNote: circulatingNote,
      valueOfAllRWA: valueOfAllRWA,
      cNotePrice: cNote?.exchangeRate ?? "0",
    },
  };
}
