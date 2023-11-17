"use client";
import Image from "next/image";
import Text from "../text";
import styles from "./footer.module.scss";
import FooterButton from "./components/footerButton";
import { useEffect, useState } from "react";
import { getTokenPriceInUSDC } from "@/utils/tokens";
import { useBlockNumber } from "wagmi";
import { CANTO_MAINNET_EVM } from "@/config/networks";

const Footer = () => {
  const [cantoPrice, setCantoPrice] = useState("0");
  const [notePrice, setNotePrice] = useState("0");

  async function getTokenPrices() {
    // canto will use WCANTO address
    const [priceCanto, priceNote] = await Promise.all([
      getTokenPriceInUSDC("0x826551890Dc65655a0Aceca109aB11AbDbD7a07B", 18),
      getTokenPriceInUSDC("0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503", 18),
    ]);
    if (!priceCanto.error) {
      setCantoPrice(priceCanto.data);
    }
    if (!priceNote.error) {
      setNotePrice(priceNote.data);
    }
  }
  useEffect(() => {
    getTokenPrices();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.links}>
        <FooterLink href="https://docs.canto.io/" text="docs" />
        <FooterLink
          href="https://discord.com/invite/63GmEXZsVf"
          text="Discord"
        />
        <FooterLink href="https://twitter.com/CantoPublic" text="twitter" />
        <FooterLink href="https://canto.mirror.xyz/" text="Blog" />
        <FooterButton text="theme" />
      </div>
      <div className={styles.links}>
        <StatusText />
        <Text
          className={styles.item}
          size="sm"
          font="proto_mono"
          style={{
            padding: "0 14px",
          }}
        >
          <Image
            src="/tokens/canto.svg"
            alt=""
            height={16}
            width={16}
            style={{
              margin: "8px",
              filter: "invert(var(--dark-mode))",
            }}
          />{" "}
          ${cantoPrice}
        </Text>
        <Text
          className={styles.item}
          size="sm"
          font="proto_mono"
          style={{
            padding: "0 14px",
          }}
        >
          <Image
            src="/tokens/note.svg"
            alt=""
            height={16}
            width={16}
            style={{
              margin: "8px",
              filter: "invert(var(--dark-mode))",
            }}
          />
          ${notePrice}
        </Text>
      </div>
    </div>
  );
};

interface PropLink {
  href: string;
  text: string;
}
const FooterLink = ({ href, text }: PropLink) => {
  return (
    <Text size="x-sm" font="proto_mono" className={styles.link}>
      <a href={href} target="_blank">
        {text}
      </a>
    </Text>
  );
};

const StatusText = () => {
  const { data: blockNumber } = useBlockNumber({
    chainId: CANTO_MAINNET_EVM.chainId,
    watch: true,
  });
  const [blockString, setBlockString] = useState("Loading....");
  useEffect(() => {
    setBlockString(blockNumber?.toString() ?? "Loading....");
  }, [blockNumber?.toString()]);
  return (
    <Text
      size="x-sm"
      font="proto_mono"
      className={styles.item}
      style={{
        width: "160px",
        justifyContent: "center",
      }}
    >
      <span className={styles.status}></span>
      {blockString}
    </Text>
  );
};
export default Footer;
