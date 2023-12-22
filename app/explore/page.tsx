"use client";

import Container from "@/components/container/container";
import style from "./outlinks.module.scss";
import Text from "@/components/text";
import Image from "next/image";
import AnimatedCircle from "@/components/animated/animatedCircle";
import Link from "next/link";
import Analytics from "@/provider/analytics";
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
          <Container
            direction="row"
            gap={20}
            center={{
              horizontal: true,
              vertical: true,
            }}
          >
            <Image
              height={100}
              width={100}
              src={"/ecosystem/1155tech.jpg"}
              alt="1155tech"
            />
            <Text size="x-sm">
              <Link
                href={"https://www.1155.tech/?rfc=378bde47-1571"}
                target="_blank"
                onClick={() => Analytics.actions.events.externalLinkClicked({Website : "1155tech"})
              }
              >
                1155tech
              </Link>{" "}
              offers a marketplace for digital art with a unique feature - users
              can earn yield each time a key they own is involved in a
              transaction, whether it’s bought, sold, or burnt. The platform is
              developed by Atrium, a top team in the crypto industry, and is
              backed by Electric Capital. They are also currently producing the
              NounsDAO movie.
            </Text>
          </Container>

          <Text size="lg">Recommended Picks</Text>
          <Container
            direction="row"
            gap={20}
            center={{
              horizontal: true,
              vertical: true,
            }}
          >
            <Image
              height={100}
              width={100}
              src={"/ecosystem/blankrasa.svg"}
              alt="blankrasa"
            />
            <Text size="x-sm">
              <Link href={"https://www.blankrasa.com/"} target="_blank" onClick={()=> Analytics.actions.events.externalLinkClicked({Website : "Blank Rasa"})}>
                Blank Rasa
              </Link>{" "}
              is a platform for discovering and trading NFTs. It features
              collections such as Canto Longneck, Shnoise, and Dead Ends.
            </Text>
          </Container>
          <Container
            direction="row"
            gap={20}
            center={{
              horizontal: true,
              vertical: true,
            }}
          >
            <Image
              height={100}
              width={100}
              src={"/ecosystem/vivacity.png"}
              alt="vivacity"
            />
            <Text size="x-sm">
              <Link href={"https://vivacity.finance/"} target="_blank" onClick={()=> Analytics.actions.events.externalLinkClicked({Website : "Vivacity Finance"})} >
                Vivacity Finance
              </Link>{" "}
              offers an onchain, institutional grade lending market for real
              world assets on Canto. Users can lend their NOTE to borrowers to
              earn additional yield.
            </Text>
          </Container>
        </div>
      </Container>
    </>
  );
}
