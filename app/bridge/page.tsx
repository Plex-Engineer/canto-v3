"use client";

import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Tabs from "@/components/tabs/tabs";
import styles from "./bridge.module.scss";
import BridgeIn from "./bridgeIn";

import { useState } from "react";

export default function BridgePage() {
  const [direction, setDirection] = useState<"in" | "out">("in");

  function BridgeOut() {
    return (
      <>
        <div className={styles["network-selection"]}></div>
        <div className={styles["token-selection"]}></div>
      </>
    );
  }

  function TxHistory() {
    return (
      <>
        <div className="transaction-list"></div>
      </>
    );
  }

  function TxRecovery() {
    return (
      <>
        <div className="recovery-list"></div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground initSize="400px" direction={direction} time={20} />
      <Container
        height="100vm"
        layer={1}
        backgroundColor="background: var(--card-background-color, #C1C1C1)"
        center={{
          horizontal: true,
          vertical: true,
        }}
      >
        <Container
          height="500px"
          width="700px"
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            tabs={[
              {
                title: "BRIDGE IN",
                content: <BridgeIn />,
                onClick: () => setDirection("in"),
              },
              {
                title: "BRIDGE OUT",
                content: BridgeOut(),
                onClick: () => setDirection("out"),
              },
              {
                title: "RECOVERY",
                isDisabled: true,
                content: TxRecovery(),
              },
              {
                title: "TX HISTORY",
                content: TxHistory(),
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
