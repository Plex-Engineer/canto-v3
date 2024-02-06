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
import {
  Chain,
  configureChains,
  createConfig,
  useChainId,
  WagmiConfig,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import * as EVM_CHAINS from "@/config/networks/evm";
import { cantoTheme } from "./util";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SafeConnector } from "wagmi/connectors/safe";
import { getNetworkInfoFromChainId } from "@/utils/networks";

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
  autoConnect: true,
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

const CustomAvatar: AvatarComponent = ({ ensImage }) => {
  const chainId = useChainId();

  const chainIcon = useMemo(() => {
    const { data: chainInfo, error } = getNetworkInfoFromChainId(chainId);
    return error ? undefined : chainInfo.icon;
  }, [chainId]);
  return (
    <Image
      src={chainIcon ?? "networks/canto.svg"}
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

const RainbowProvider = ({ children }: RainbowProviderProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <RainbowKitProvider
      avatar={CustomAvatar}
      chains={chains}
      modalSize="wide"
      theme={cantoTheme}
      initialChain={EVM_CHAINS.CANTO_MAINNET_EVM.chainId}
    >
      {mounted && children}
    </RainbowKitProvider>
  );
};

const CantoWalletProvider = ({ children }: RainbowProviderProps) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowProvider>{children}</RainbowProvider>
    </WagmiConfig>
  );
};

export default CantoWalletProvider;
