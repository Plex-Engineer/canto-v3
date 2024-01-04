"use client";

import Container from "@/components/container/container";
import style from "./outlinks.module.scss";
import Text from "@/components/text";
import ExploreLink from "./components/link";

export default function OutlinksPage() {
  return (
    <>
      {/* <AnimatedCircle /> */}
      <Container
        center={{
          horizontal: true,
          vertical: true,
        }}
      >
        <div className={style.container}>
          <Text
            size="x-lg"
            style={{
              fontSize: "28px",
              textAlign: "center",
            }}
          >
            Cool on Canto
          </Text>
          <Text size="lg">Top Picks</Text>

          <ExploreLink
            link="https://www.1155.tech/?rfc=378bde47-1571"
            description="offers a marketplace for digital art with a unique feature - users
              can earn yield each time a key they own is involved in a
              transaction, whether it’s bought, sold, or burnt. The platform is
              developed by Atrium, a top team in the crypto industry, and is
              backed by Electric Capital. They are also currently producing the
              NounsDAO movie."
            image="/ecosystem/1155tech.jpg"
            title="1155tech"
          />

          <Text size="lg">Recommended Picks</Text>

          <ExploreLink
            link="https://www.blankrasa.com/"
            description="is a platform for discovering and trading NFTs. It features collections such as Canto Longneck, Shnoise, and Dead Ends."
            image="/ecosystem/blankrasa.svg"
            title="Blank Rasa"
          />

          <ExploreLink
            link="https://vivacity.finance/"
            description="offers an onchain, institutional grade lending market for real
              world assets on Canto. Users can lend their NOTE to borrowers to
              earn additional yield."
            image="/ecosystem/vivacity.png"
            title="Vivacity Finance"
          />
        </div>
      </Container>
    </>
  );
}
