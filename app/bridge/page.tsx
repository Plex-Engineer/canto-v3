"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Bridging from "./bridging";
import Tabs from "@/components/tabs/tabs";
import useBridgeCombo from "./util";
import BridgeInProgress from "./components/bridgeInProgress";
import styles from "./bridge.module.scss";
import useBridgingInProgess from "@/hooks/bridge/useBridgingInProgress";
import useScreenSize from "@/hooks/helpers/useScreenSize";
import EthBridgeIn from "./ethBridgeIn/BridgeIn";
import { useEffect, useState } from "react";
import { getSendToCosmosEvents } from "@/utils/bridge";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";

export default function BridgePage() {
  const bridgeCombo = useBridgeCombo();
  const { Direction } = bridgeCombo;
  const bridgeProgress = useBridgingInProgess();
  const { isMobile } = useScreenSize();

  const [ethBridgeIn, setEthBridgeIn] = useState(true);

  const { signer } = useCantoSigner();
  const [bridgeHistory, setBridgeHistory] = useState<any>(null);
  useEffect(() => {
    if (signer?.account.address) {
      getSendToCosmosEvents(signer.account.address).then(setBridgeHistory);
    }
  }, [signer?.account.address]);
  console.log(bridgeHistory);
  return (
    <>
      <AnimatedBackground
        initSize="400px"
        direction={Direction.direction}
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
          width={isMobile ? "100vw" : "700px"}
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            shadows
            defaultIndex={Direction.direction === "in" ? 0 : 1}
            tabs={[
              {
                title: "BRIDGE IN",
                content: ethBridgeIn ? (
                  <EthBridgeIn
                    key={"eth-bridge-in"}
                    setEthBridgeIn={() => setEthBridgeIn(false)}
                  />
                ) : (
                  <Bridging
                    key={"bridge-in"}
                    props={{
                      ...bridgeCombo,
                      setEthBridgeIn: () => setEthBridgeIn(true),
                    }}
                  />
                ),
                onClick: () => Direction.setDirection("in"),
              },
              {
                title: "BRIDGE OUT",
                content: <Bridging key={"bridge-out"} props={bridgeCombo} />,
                onClick: () => Direction.setDirection("out"),
              },
              {
                title: "IN PROGRESS",
                extraTitle:
                  bridgeProgress.inProgressTxs.pending.length > 0 ? (
                    <div className={styles.notification}>
                      {bridgeProgress.inProgressTxs.pending.length.toString()}
                    </div>
                  ) : null,
                content: (
                  <BridgeInProgress
                    key={"in-progress"}
                    txs={bridgeProgress.inProgressTxs}
                    clearTxs={bridgeProgress.clearTxs}
                    setTxBridgeStatus={bridgeProgress.setTxBridgeStatus}
                  />
                ),
                hideOnMobile: true,
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
