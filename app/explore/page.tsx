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
              </Link>
              : Your digital art can now reward you. 1155tech is not just
              another art marketplace; receive a yield each time a key you own
              is bought, sold, or burnt. It’s built by Atrium, one of the top
              teams in crypto, and is backed by Electric Capital. They are also
              currently producing the NounsDAO Movie.
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
              </Link>
              : Discover NFTs with character on Blank Rasa. Home to the coveted
              Canto Longneck, Shnoise, and Dead Ends collections. Step into
              Canto’s dynamic NFT community and start curating your collection.
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
              </Link>
              : Canto’s RWA lending market. Earn extra yield by lending your
              NOTE to borrowers. It’s built by B-Harvest, one of the most
              respected engineering names in the Cosmos community.
            </Text>
          </Container>
        </div>
      </Container>
    </>
  );
}
