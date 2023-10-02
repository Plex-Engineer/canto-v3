"use client";

import useTestLP from "@/hooks/lpInterface/testUseLP";
import Container from "@/components/container/container";
import Text from "@/components/text";

export default function Home() {
  const lp = useTestLP();
  return (
    <Container
      center={{
        vertical: true,
        horizontal: true,
      }}
    >
      <Text font="proto_mono" size="x-lg">
        Welcome to Canto-v3
      </Text>
    </Container>
  );
}
