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
import Tabs from "@/components/tabs/tabs";
import useBridgeCombo from "./util";

export default function BridgePage() {
  const {
    bridgeDirection,
    bridgeIn,
    bridgeOut,
    txStore,
    signer,
    router,
    pathName,
    createQueryString,
  } = useBridgeCombo();

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
                    type="in"
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
                    type="out"
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
