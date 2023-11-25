import "@rainbow-me/rainbowkit/styles.css";
import {
  AvatarComponent,
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { Chain, configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import * as EVM_CHAINS from "@/config/networks/evm";
import { cantoTheme } from "./util";
import { useEffect, useState } from "react";
import Image from "next/image";
import { SafeConnector } from "wagmi/connectors/safe";

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

// const specificConnectors = connectorsForWallets([
//   {
//     groupName: "Recommended",
//     wallets: [
//       injectedWallet({
//         chains,
//       }),
//     ],
//   },
// ]);

const wagmiConfig = createConfig({
  // Make sure to omit the autoConnect property or set it to false.
  // Wagmi library automatically connects to the last used provider,
  // but instead we want to automatically connect to the Safe if the app is loaded in the Safe Context.
  // Autoconnect logic implemented via a separate hook useAutoConnect().
  autoConnect: false,
  connectors: [
    ...connectors(),
    new SafeConnector({
      chains,
      options: {
        allowedDomains: [/safe.neobase.one$/],
        debug: false,
      },
    }),
  ],
  publicClient,
});

const CustomAvatar: AvatarComponent = () => {
  return (
    <Image
      src="networks/canto.svg"
      style={{
        width: "100%",
        height: "100%",
      }}
      width={64}
      height={64}
      alt="logo"
    />
  );
};

interface RainbowProviderProps {
  children: React.ReactNode;
}
const CantoWalletProvider = ({ children }: RainbowProviderProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        avatar={CustomAvatar}
        chains={chains}
        modalSize="wide"
        theme={cantoTheme}
        initialChain={EVM_CHAINS.CANTO_MAINNET_EVM.chainId}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default CantoWalletProvider;
