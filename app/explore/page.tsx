import Container from "@/components/container/container";
import style from "./outlinks.module.scss";
import Text from "@/components/text";
import Image from "next/image";
import AnimatedCircle from "@/components/animated/animatedCircle";
import Link from "next/link";
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
              >
                1155tech
              </Link>{" "}
              is a platform for earning money by collecting digital art.
              1155tech is the only art market that pays you. It is powered by
              one of the top teams in crypto, Atrium. They are backed by
              Electric Capital and currently producing the NounsDAO Movie.
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
              src={"/ecosystem/blankrase.jpg"}
              alt="1155tech"
            />
            <Text size="x-sm">
              <Link href={"https://www.blankrasa.com/"} target="_blank">
                Blank Rasa
              </Link>{" "}
              is canto’s NFT market. The only place to buy a Canto Longneck, a
              Shnoise or a Dead Ends. It is celebrated for it’s great UX and is
              a cornerstone of the canto NFT ecosystem.
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
              src={"/ecosystem/vivacity.jpg"}
              alt="1155tech"
            />
            <Text size="x-sm">
              <Link href={"https://vivacity.finance/"} target="_blank">
                Vivacity Finance
              </Link>{" "}
              is canto’s RWA lending market. Earn extra yield lending your NOTE
              to borrowers. Vivacity Finance’s core team is B-Harvest, one of
              the most respected engineering names in the Cosmos community.
            </Text>
          </Container>
        </div>
      </Container>
    </>
  );
}
