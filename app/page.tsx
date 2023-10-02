"use client";

import Container from "@/components/container/container";
import Text from "@/components/text";
import { TestAmbient } from "./testAmbient";

export default function Home() {
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
      <TestAmbient />
    </Container>
  );
}
