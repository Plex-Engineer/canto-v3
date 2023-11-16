"use client";
import { useCallback, useEffect, useState } from "react";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import { connectToKeplr } from "@/utils/keplr";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "@/utils/networks";
import Bridging from "./bridging";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import Tabs from "@/components/nTabs/tabs";

export default function BridgePage() {
  // router info
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // query params
  const bridgeDirection = () => {
    const direction = searchParams.get("direction");

    if (direction === "in") return "in";
    if (direction === "out") return "out";
    return "in";
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // bridge hooks
  const { txStore, signer } = useCantoSigner();
  const [onTestnet, setOnTestnet] = useState<boolean>(false);
  const bridgeOut = useBridgeOut({
    testnet: onTestnet,
  });
  const bridgeIn = useBridgeIn({
    testnet: onTestnet,
  });

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      if (!network || !isCosmosNetwork(network)) return;
      const keplrClient = await connectToKeplr(network.chainId);
      bridgeIn.setState("cosmosAddress", keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    const { data: network, error } = getNetworkInfoFromChainId(
      signer?.chain.id ?? 1
    );
    if (error) {
      console.log(error);
      return;
    }
    setOnTestnet(network.isTestChain);
  }, [signer?.chain.id]);

  useEffect(() => {
    // set the signer address
    bridgeIn.setState("ethAddress", signer?.account.address);
    bridgeOut.setState("ethAddress", signer?.account.address);
  }, [signer?.account.address]);

  return (
    <>
      <AnimatedBackground
        initSize="400px"
        direction={bridgeDirection()}
        time={20}
      />
      <Container
        layer={1}
        center={{
          horizontal: true,
          vertical: true,
        }}
      >
        <Container
          width="700px"
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            // height="510px"
            shadows
            defaultIndex={bridgeDirection() === "in" ? 0 : 1}
            tabs={[
              {
                title: "BRIDGE IN",
                content: (
                  <Bridging
                    hook={bridgeIn}
                    params={{
                      signer: signer,
                      transactionStore: txStore,
                    }}
                  />
                ),
                onClick: () =>
                  router.push(
                    pathName + "?" + createQueryString("direction", "in")
                  ),
              },
              {
                title: "BRIDGE OUT",
                content: (
                  <Bridging
                    hook={bridgeOut}
                    params={{
                      signer: signer,
                      transactionStore: txStore,
                    }}
                  />
                ),
                onClick: () =>
                  router.push(
                    pathName + "?" + createQueryString("direction", "out")
                  ),
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
