import { getCTokensFromType } from "@/hooks/lending/config/cTokenAddresses";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import useLending from "@/hooks/lending/useLending";
import useTransactionStore from "@/stores/transactionStore";
import { listIncludesAddress } from "@/utils/address.utils";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { useStore } from "zustand";

interface LendingComboReturn {
  cTokens: {
    cNote: CTokenWithUserData | undefined;
    rwas: CTokenWithUserData[];
  };
  position: UserLMPosition;
  transaction: {
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    canPerformTx: (amount: string, txType: CTokenLendingTxTypes) => boolean;
  };
  selection: {
    selectedToken: CTokenWithUserData | null;
    setSelectedToken: (token: CTokenWithUserData | null) => void;
    amount: string;
    setAmount: (amount: string) => void;
    modalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    currentAction: CTokenLendingTxTypes;
    setCurrentAction: (action: CTokenLendingTxTypes) => void;
  };
}
export function useLendingCombo(): LendingComboReturn {
  // params for useLending hook
  const { data: signer } = useWalletClient();
  const chainId = signer?.chain.id === 7701 ? 7701 : 7700;
  const { cTokens, position, loading, transaction } = useLending({
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

  //////TODO:
  // page state, should be moved to page itself
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [amount, setAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<CTokenLendingTxTypes>(
    CTokenLendingTxTypes.SUPPLY
  );

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
    cTokens: {
      cNote,
      rwas,
    },
    position,
    transaction: {
      performTx: lendingTx,
      canPerformTx,
    },
    selection: {
      selectedToken,
      setSelectedToken,
      amount,
      setAmount,
      modalOpen,
      setModalOpen,
      currentAction,
      setCurrentAction,
    },
  };
}
