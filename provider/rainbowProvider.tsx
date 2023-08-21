import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import * as EVM_CHAINS from "@/config/networks/evm";

const formattedChains: Chain[] = [...Object.values(EVM_CHAINS)].map(
  (network) => {
    const contractInfo = network.multicall3Address
      ? {
          multicall3: { address: network.multicall3Address },
        }
      : {};
    return {
      id: Number(network.chainId),
      iconUrl: network.icon,
      name: network.name,
      network: network.name,
      nativeCurrency: network.nativeCurrency,
      rpcUrls: {
        default: { http: [network.rpcUrl] },
        public: { http: [network.rpcUrl] },
      },
      blockExplorers: {
        default: {
          name: network.name,
          url: network.blockExplorer?.url as string,
        },
      },
      testnet: network.isTestChain,
      contracts: contractInfo,
    };
  }
);

const { chains, publicClient } = configureChains(formattedChains, [
  publicProvider(),
]);
const { connectors } = getDefaultWallets({
  appName: "Canto v3",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

interface RainbowProviderProps {
  children: React.ReactNode;
}
const CantoWalletProvider = ({ children }: RainbowProviderProps) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default CantoWalletProvider;
