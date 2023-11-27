"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Bridging from "./bridging";
import Tabs from "@/components/tabs/tabs";
import useBridgeCombo from "./util";

export default function BridgePage() {
  const { bridgeDirection, router, pathName, createQueryString } =
    useBridgeCombo("in");

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
            shadows
            defaultIndex={bridgeDirection() === "in" ? 0 : 1}
            tabs={[
              {
                title: "BRIDGE IN",
                content: <Bridging key={"bridge-in"} type="in" />,
                onClick: () =>
                  router.push(
                    pathName + "?" + createQueryString("direction", "in")
                  ),
              },
              {
                title: "BRIDGE OUT",
                content: <Bridging key={"bridge-out"} type="out" />,
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
