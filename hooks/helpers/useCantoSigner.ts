import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import useTransactionStore, {
  TransactionStore,
} from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { GetWalletClientResult } from "wagmi/actions";

export default function useCantoSigner(): {
  txStore: TransactionStore | undefined;
  signer: GetWalletClientResult | undefined;
  chainId: number;
} {
  const txStore = useStore(useTransactionStore, (state) => state);
  const { data: signer } = useWalletClient();
  // set chain id to canto network
  const chainId =
    signer?.chain.id === CANTO_TESTNET_EVM.chainId
      ? CANTO_TESTNET_EVM.chainId
      : CANTO_MAINNET_EVM.chainId;

  return {
    txStore,
    signer,
    chainId,
  };
}
