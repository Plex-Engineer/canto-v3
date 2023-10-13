"use client";

import Container from "@/components/container/container";
import Text from "@/components/text";
import styles from "./home.module.scss";
import EcoTile from "./components/ecoTile";
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

      <section className={styles.ecosystem}>
        <Text font="proto_mono" size="title">
          Ecosystem
        </Text>

        <div className={styles["eco-grid"]}>
          <EcoTile
            name="Blank Rasa"
            description="Buy and Sell NFTs"
            image="/ecosystem/blank-rasa.svg"
            link="https://www.blankrasa.com/"
          />

          <EcoTile
            name="Slingshot"
            description="Swap tokens on Canto and 8 other networks"
            image="/ecosystem/slingshot.svg"
            link="https://slingshot.finance/"
          />

          <EcoTile
            name="Cadence Protocol"
            description="Next-gen decentralized perpetuals"
            image="/ecosystem/cad.png"
            link="https://www.cadenceprotocol.io/"
          />

          <EcoTile
            name="Vivacity (coming soon)"
            description="Yet to be announced"
            image="/ecosystem/blankRasa.svg"
            link="https://blankrasa.io/"
          />
        </div>
      </section>
    </Container>
  );
}
