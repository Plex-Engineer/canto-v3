import { getCTokensFromType } from "@/hooks/lending/config/cTokenAddresses";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import useLending from "@/hooks/lending/useLending";
import useTransactionStore from "@/stores/transactionStore";
import { listIncludesAddress } from "@/utils/address.utils";
import { addTokenBalances } from "@/utils/tokenBalances.utils";
import BigNumber from "bignumber.js";
import { useWalletClient } from "wagmi";
import { useStore } from "zustand";

interface LendingComboReturn {
  cTokens: {
    cNote: CTokenWithUserData | undefined;
    rwas: CTokenWithUserData[];
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
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    canPerformTx: (amount: string, txType: CTokenLendingTxTypes) => boolean;
  };
  selection: {
    selectedCToken: CTokenWithUserData | undefined;
    setSelectedCToken: (address: string | null) => void;
  };
}
export function useLendingCombo(): LendingComboReturn {
  // params for useLending hook
  const { data: signer } = useWalletClient();
  const chainId = signer?.chain.id === 7701 ? 7701 : 7700;
  const { cTokens, position, isLoading, transaction, selection } = useLending({
    chainId,
    lmType: "lending",
    userEthAddress: signer?.account.address,
  });

  // transaction store
  const txStore = useStore(useTransactionStore, (state) => state);

  // sorted tokens
  const cNoteAddress = getCTokensFromType(chainId, "cNote");
  const cNote = cTokens.find((cToken) => cToken.address === cNoteAddress);

  const rwaAddressList = getCTokensFromType(chainId, "rwas");
  const rwas = cTokens.filter((cToken) =>
    listIncludesAddress(rwaAddressList ?? [], cToken.address)
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

  // transaction functions
  function lendingTx(amount: string, txType: CTokenLendingTxTypes) {
    if (!selection.selectedCToken || !signer) return;
    const { data, error } = transaction.createNewLendingFlow({
      chainId: signer.chain.id,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
    });
    if (error) {
      console.log(error);
      return;
    }
    txStore?.addNewFlow({ txFlow: data, signer });
  }
  const canPerformTx = (
    amount: string,
    txType: CTokenLendingTxTypes
  ): boolean =>
    selection.selectedCToken &&
    signer &&
    transaction.canPerformLendingTx({
      chainId: signer.chain.id,
      ethAccount: signer.account.address,
      cToken: selection.selectedCToken,
      amount,
      txType,
    }).data
      ? true
      : false;

  return {
    cTokens: {
      cNote,
      rwas,
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
      canPerformTx,
    },
    selection,
  };
}
