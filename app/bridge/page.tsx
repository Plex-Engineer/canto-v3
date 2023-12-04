"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Bridging from "./bridging";
import Tabs from "@/components/tabs/tabs";
import useBridgeCombo from "./util";

export default function BridgePage() {
  const bridgeCombo = useBridgeCombo();
  const { Direction } = bridgeCombo;
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
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
