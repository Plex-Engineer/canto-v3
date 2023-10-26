"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Tabs from "@/components/tabs/tabs";
import { useState } from "react";

export default function GovernancePage() {

  const [activeTab, setActiveTab] = useState("All");

  function switchActiveTab(activeTab: string) {
    setActiveTab(activeTab);
  }

  

  return (
    <div>
      <Tabs
        tabs={[
          {
            title: "ALL",
            content: (
              <Container>
                All Proposals
              </Container>
            ),
            onClick: () => switchActiveTab("All"),
          },
          {
            title: "ACTIVE",
            content: (
              <Container>
                Active Proposals
              </Container>
            ),
            onClick: () => switchActiveTab("Active"),
          },
          {
            title: "REJECTED",
            content: (
              <Container>
                Rejected Proposals
              </Container>
            ),
            onClick: () => switchActiveTab("Rejected"),
          },
        ]}
      />
    </div>
  );
  return <div>{/* <AnimatedBackground /> */}</div>;
}
