"use client";
import Link from "next/link";
import styles from "./navbar.module.scss";
import Text from "../text";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import TransactionModal from "../transactions/TxModal";
import ThemeButton from "../footer/components/footerButton";
import { useEffect, useState } from "react";
import Analytics from "@/provider/analytics";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { useBalance } from "wagmi";
import { useAutoConnect } from "@/provider/useAutoConnect";
import Icon from "../icon/icon";
import MoreOptionsModal from "../../components/navBarModal/navBarModal";
import Modal from "../modal/modal";

const NavBar = () => {
  // This is used to connect safe as wallet,
  // if the app is opened in the safe context.
  useAutoConnect();
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const { signer } = useCantoSigner();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const handleMoreClick = () => {
    setIsMoreModalOpen((current) => !current);
  };

  const handleModalClose = () => {
    setIsMoreModalOpen(false);
  };

  const handleMoreOptionSelect = (option: string) => {
    // Handle the option selection (e.g., navigate to the selected link)
    //setIsMoreModalOpen(false);
    setSelectedOption(option);
  };
  useEffect(() => {
    // This effect will run after the component has been re-rendered
    if (selectedOption) {
      setIsMoreModalOpen(false);
      // Additional logic or navigation here if needed
    }
  }, [selectedOption]);
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
    let url = window.origin + currentPath;
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    if (currentPath == "/bridge") {
      Analytics.actions.events.pageOpened("bridge", url);
    } else if (currentPath == "/lending") {
      Analytics.actions.events.pageOpened("lending", url);
    } else if (currentPath == "/lp") {
      Analytics.actions.events.pageOpened("lp interface", url);
    } else if (currentPath == "/explore") {
      Analytics.actions.events.pageOpened("explore", url);
    } else if (currentPath == "/staking") {
      Analytics.actions.events.pageOpened("staking", url);
    } else if (currentPath == "/governance") {
      Analytics.actions.events.pageOpened("governance", url);
    } else {
      Analytics.actions.events.pageOpened("home", url);
    }
    isMenuOpen && setIsMenuOpen(false);
  }, [currentPath, searchParams, signer]);

  const balance = useBalance({
    address: signer?.account.address,
    watch: true,
    chainId: signer?.chain.id,
  });

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <button
          className={styles.menu}
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <Icon
            icon={{
              url: "/menu.svg",
              size: 56,
            }}
            themed
          />
        </button>
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

      <div className={styles["nav-links"]} data-menu-open={isMenuOpen}>
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
          href="/explore"
          className={clsx(
            styles["nav-link"],
            currentPath == "/explore" && styles.active
          )}
        >
          <Text size="sm">Explore</Text>
        </Link>
        {currentPath == "/staking" && (
          <Link
            href="/staking"
            className={clsx(
              styles["nav-link"],
              currentPath == "/staking" && styles.active
            )}
          >
            <Text size="sm">Staking</Text>
          </Link>
        )}
        {currentPath == "/governance" && (
          <Link
            href="/governance"
            className={clsx(
              styles["nav-link"],
              currentPath.includes("governance") && styles.active
            )}
          >
            <Text size="sm">Governance</Text>
          </Link>
        )}

        {/* {selectedOption != "" && (
          <div>
            <Link
              href={"/" + selectedOption}
              className={clsx(
                styles["nav-link"],
                currentPath.includes(selectedOption) && styles.active
              )}
            >
              <Text size="sm">
                {selectedOption.charAt(0).toUpperCase() +
                  selectedOption.slice(1)}
              </Text>
            </Link>
          </div>
        )} */}
        <div className={styles.moreLink} onClick={handleMoreClick}>
          <div className={styles.moreButtonContainer}>
            <Text size="sm">More</Text>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                icon={{
                  url: "/dropdown.svg",
                  size: 18,
                }}
                themed
              />
            </div>
          </div>
          {isMoreModalOpen && (
            <div className={styles.popUp}>
              {currentPath != "/staking" && (
                <div
                  className={styles.optionsContainer}
                  onClick={() => handleMoreOptionSelect("staking")}
                >
                  <Link href="/staking" className={clsx(styles["nav-link"])}>
                    <Text size="sm">Staking</Text>
                  </Link>
                </div>
              )}
              {currentPath != "/governance" && (
                <div
                  className={styles.optionsContainer}
                  onClick={() => handleMoreOptionSelect("governance")}
                >
                  <Link href="/governance" className={clsx(styles["nav-link"])}>
                    <Text size="sm">Governance</Text>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* {isMoreModalOpen && (
            <Modal
              open={isMoreModalOpen}
              onClose={() => setIsMoreModalOpen(false)}
            >
              <MoreOptionsModal
                onClose={() => setIsMoreModalOpen(false)}
                onSelect={handleMoreOptionSelect}
              />
            </Modal>
          )} */}
        </div>
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
