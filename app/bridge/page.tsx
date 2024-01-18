"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Bridging from "./bridging";
import Tabs from "@/components/tabs/tabs";
import useBridgeCombo from "./util";
import BridgeInProgress from "./components/bridgeInProgress";
import styles from "./bridge.module.scss";
import useBridgingInProgess from "@/hooks/bridge/useBridgingInProgress";
import DesktopOnly from "@/components/desktop-only/desktop-only";

export default function BridgePage() {
  const bridgeCombo = useBridgeCombo();
  const { Direction } = bridgeCombo;
  const bridgeProgress = useBridgingInProgess();

  //   if mobile only
  if (!window.matchMedia("(min-width: 768px)").matches) {
    return <DesktopOnly />;
  }
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
          width="700px"
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            shadows
            defaultIndex={Direction.direction === "in" ? 0 : 1}
            tabs={[
              {
                title: "BRIDGE IN",
                content: <Bridging key={"bridge-in"} props={bridgeCombo} />,
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
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
