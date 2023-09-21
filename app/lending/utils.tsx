import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import useLending from "@/hooks/lending/useLending";
import useTransactionStore from "@/stores/transactionStore";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";
import { useMemo, useState } from "react";
import { useWalletClient } from "wagmi";
import { useStore } from "zustand";

export function useLendingCombo() {
  const { data: signer } = useWalletClient();

  const { cTokens, position, loading, transaction, cNote } = useLending({
    chainId: signer?.chain.id === 7701 ? 7701 : 7700,
    cTokenType: "lending",
    userEthAddress: signer?.account.address,
  });
  const [amount, setAmount] = useState("");

  const sortedTokens = useMemo(() => {
    return cTokens.sort((a, b) =>
      a.underlying.symbol.localeCompare(b.underlying.symbol)
    );
  }, [cTokens]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const [currentAction, setCurrentAction] = useState<CTokenLendingTxTypes>(
    CTokenLendingTxTypes.SUPPLY
  );

  const txStore = useStore(useTransactionStore, (state) => state);

  function lendingTx(amount: string, txType: CTokenLendingTxTypes) {
    const { data, error } = transaction.createNewLendingFlow({
      chainId: signer?.chain.id ?? 0,
      ethAccount: signer?.account.address ?? "",
      cToken: selectedToken,
      amount: convertToBigNumber(
        amount,
        selectedToken.underlying.decimals
      ).data.toString(),
      txType,
    });
    if (error) {
      console.log(error);
      return;
    }
    txStore?.addNewFlow({ txFlow: data, signer });
  }

  const canPerformTx = (amount: string, txType: CTokenLendingTxTypes) =>
    !isNaN(Number(amount)) &&
    transaction.canPerformLendingTx({
      chainId: signer?.chain.id ?? 7700,
      ethAccount: signer?.account.address ?? "",
      cToken: selectedToken,
      amount: convertToBigNumber(
        amount,
        selectedToken.underlying.decimals
      ).data?.toString(),
      txType,
    }).data;

  return {
    cTokens,
    sortedTokens,
    position,
    loading,
    modalOpen,
    setModalOpen,
    selectedToken,
    setSelectedToken,
    currentAction,
    setCurrentAction,
    lendingTx,
    canPerformTx,
    txStore,
    cNote,
    amount,
    setAmount,
  };
}
