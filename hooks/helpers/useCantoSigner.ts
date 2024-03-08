import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import useTransactionStore, {
  TransactionStore,
} from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { Config, useWalletClient } from "wagmi";
import { GetWalletClientData } from "wagmi/query";

export type Signer = GetWalletClientData<Config, number>;

export default function useCantoSigner(): {
  txStore: TransactionStore | undefined;
  signer: Signer | undefined;
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
