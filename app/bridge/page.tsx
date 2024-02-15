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

export default function BridgePage() {
  const bridgeCombo = useBridgeCombo();
  const { Direction } = bridgeCombo;
  const bridgeProgress = useBridgingInProgess();
  const { isMobile } = useScreenSize();

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
                hideOnMobile: true,
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
