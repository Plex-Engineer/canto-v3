import Image from "next/image";
import Text from "../text";
import styles from "./footer.module.scss";

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.links}>
        <FooterLink href="https://canto.mirror.xyz/" text="about" />
        <FooterLink href="https://docs.canto.io/" text="docs" />
        <FooterLink href="https://canto.build/" text="commons" />
        <FooterLink href="https://canto.canny.io/" text="report bug" />
        <FooterLink href="https://v2.canto.io/" text="canto v2" />
      </div>
      <div className={styles.links}>
        <StatusText />
        <Text
          size="sm"
          name="proto_mono"
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
            }}
          />{" "}
          $0.1101
        </Text>
        <Text
          size="sm"
          name="proto_mono"
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
            }}
          />
          $1.0094
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
    <Text size="x-sm" name="proto_mono">
      <a href={href}>{text}</a>
    </Text>
  );
};

const StatusText = () => {
  return (
    <Text
      size="x-sm"
      name="proto_mono"
      style={{
        width: "200px",
        justifyContent: "center",
      }}
    >
      <span className={styles.status}></span>
      live data feed
    </Text>
  );
};
export default Footer;
