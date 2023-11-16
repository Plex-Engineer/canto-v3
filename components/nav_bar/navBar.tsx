"use client";
import Link from "next/link";
import styles from "./navbar.module.scss";
import Text from "../text";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TransactionModal from "../transactions/TxModal";
import ThemeButton from "../footer/components/footerButton";

const NavBar = () => {
  const currentPath = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/tokens/canto.svg"
            width={40}
            height={40}
            alt="canto"
            style={{
              filter: "invert(var(--dark-mode))",
            }}
          />
        </Link>
      </div>

      <div className={styles["nav-links"]}>
        <Link
          href="/bridge"
          className={clsx(
            styles["nav-link"],
            currentPath == "/bridge" && styles.active
          )}
        >
          <Text size="sm">Bridge</Text>
        </Link>
        {/* <Link
          href="/staking"
          className={clsx(
            styles["nav-link"],
            currentPath == "/staking" && styles.active
          )}
        >
          <Text>Staking</Text>
        </Link> */}
        <Link
          href="/lending"
          className={clsx(
            styles["nav-link"],
            currentPath == "/lending" && styles.active
          )}
        >
          <Text size="sm">Lending</Text>
        </Link>
        <Link
          href="/lp"
          className={clsx(
            styles["nav-link"],
            currentPath == "/lp" && styles.active
          )}
        >
          <Text size="sm">Pools</Text>
        </Link>
        {/* <Link
          href="/governance"
          className={clsx(
            styles["nav-link"],
            currentPath == "/governance" && styles.active
          )}
        >
          <Text>Governance</Text>
        </Link> */}
      </div>
      <div className={styles["btn-grp"]}>
        <div className={styles.theme}>
          <ThemeButton />
        </div>
        <div className={styles.activity}>
          <TransactionModal />
        </div>
        <div className={styles["wallet-connect"]}>
          <ConnectButton chainStatus={"none"} />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
