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
import { useEffect } from "react";
import Analytics from "@/provider/analytics";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { useBalance } from "wagmi";
import { useAutoConnect } from "@/provider/useAutoConnect";

const NavBar = () => {
  // This is used to connect safe as wallet,
  // if the app is opened in the safe context.
  useAutoConnect();
  const currentPath = usePathname();
  const { signer } = useCantoSigner();

  useEffect(() => {
    if (signer?.account.address) {
      Analytics.actions.people.registerWallet(signer.account.address);
      Analytics.actions.identify(signer.account.address, {
        account: signer.account.address,
      });
      Analytics.actions.events.connections.walletConnect(true);
    }
  }, [signer]);

  useEffect(() => {
    if (currentPath == "/bridge") {
      Analytics.actions.events.pageOpened("bridge");
    } else if (currentPath == "/lending") {
      Analytics.actions.events.pageOpened("lending");
    } else if (currentPath == "/lp") {
      Analytics.actions.events.pageOpened("lp interface");
    } else if (currentPath == "/explore") {
      Analytics.actions.events.pageOpened("explore");
    } else {
      Analytics.actions.events.pageOpened("home");
    }
  }, [currentPath, signer]);

  const balance = useBalance({
    address: signer?.account.address,
    watch: true,
    chainId: signer?.chain.id,
  });

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
        <Link
          href="/staking"
          className={clsx(
            styles["nav-link"],
            currentPath == "/staking" && styles.active
          )}
        >
          <Text size="sm">Staking</Text>
        </Link>
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

        <Link
          href="/governance"
          className={clsx(
            styles["nav-link"],
            currentPath.includes("governance") && styles.active
          )}
        >
          <Text size="sm">Governance</Text>
        </Link>
      </div>
      <div className={styles["btn-grp"]}>
        <div className={styles.theme}>
          <ThemeButton />
        </div>
        <div className={styles.activity}>
          <TransactionModal />
        </div>
        <div className={styles["wallet-connect"]}>
          <ConnectButton key={balance.data?.formatted} chainStatus={"none"} />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
