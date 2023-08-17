import Link from "next/link";
import styles from "./navbar.module.scss";
import Text from "../text";
import Image from "next/image";
import Button from "../button/button";

const NavBar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image
          src="/tokens/canto.svg"
          width={50}
          height={50}
          alt="canto"
          style={{
            filter: "invert(var(--dark-mode))",
          }}
        />
      </div>

      <div className={styles["nav-links"]}>
        <Link href="/" className={styles["nav-link"]}>
          <Text>Home</Text>
        </Link>
        <Link href="/bridge" className={styles["nav-link"]}>
          <Text>Bridge</Text>
        </Link>
        <Link href="/staking" className={styles["nav-link"]}>
          <Text>Staking</Text>
        </Link>
        <Link href="/lending" className={styles["nav-link"]}>
          <Text>Lending</Text>
        </Link>
        <Link href="/governance" className={styles["nav-link"]}>
          <Text>Governance</Text>
        </Link>
      </div>

      <div className={styles["wallet-connect"]}>
        <Button color="secondary">Connect Wallet</Button>
      </div>
    </div>
  );
};

export default NavBar;
