import { Chain, WagmiConfig, configureChains, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
  getDefaultConnectors,
} from "connectkit";
import * as EVM_CHAINS from "@/config/networks/evm";
import { publicProvider } from "wagmi/providers/public";
import { EVMNetwork } from "@/config/interfaces";
import { useEffect, useState } from "react";

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
      // eth main must have ens resolver
      contracts:
        network.chainId === EVM_CHAINS.ETH_MAINNET.chainId
          ? {
              ...contractInfo,
              ensUniversalResolver: {
                address: "0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62",
              },
            }
          : contractInfo,
    } as Chain;
  }
);

const { chains, publicClient } = configureChains(formattedChains, [
  publicProvider(),
]);

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    autoConnect: true,
    alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,

    // Required
    appName: "Canto Blockchain",

    // Optional
    appDescription: "Canto v3 is an interface for the Canto Protocol.",
    appUrl: "https://canto.io", // your app's url
    appIcon: "https://canto.io/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: getDefaultConnectors({
    app: {
      name: "Canto v3",
      url: "https://canto.io",
      icon: "https://canto.io/logo.png",
    },
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    chains,
  }),

  publicClient,
});

const CantoWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider>
        {mounted && children}
        <ConnectKitButton />
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default CantoWalletProvider;
