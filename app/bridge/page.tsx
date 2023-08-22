"use client";

import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Tabs from "@/components/tabs/tabs";
import Text from "@/components/text";
import { useState } from "react";

export default function BridgePage() {
  const [direction, setDirection] = useState<"in" | "out">("in");
  return (
    <>
      <AnimatedBackground initSize="400px" direction={direction} time={20} />
      <Container
        height="100vm"
        layer={1}
        backgroundColor="background: var(--card-background-color, #C1C1C1)"
        center
      >
        <Container
          height="500px"
          width="700px"
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            tabs={[
              {
                title: "bridge in",
                content: <Text>Tab 1</Text>,
                onClick: () => setDirection("in"),
              },
              {
                title: "bridge out",
                content: <Text>Tab 2</Text>,
                onClick: () => setDirection("out"),
              },
              {
                title: "Recovery",
                isDisabled: true,
                content: <Text>Tab 3</Text>,
              },
              {
                title: "tx history",
                content: <Text>Tab 4</Text>,
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
