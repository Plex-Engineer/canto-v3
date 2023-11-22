"use client";
import Spacer from "@/components/layout/spacer";
import Selector from "@/components/selector/selector";
import Text from "@/components/text";
import { displayAmount, formatBalance } from "@/utils/formatting";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";
import Image from "next/image";
import Modal from "@/components/modal/modal";
import ConfirmationModal from "./components/confirmationModal";
import { isEVMNetwork } from "@/utils/networks";
import { ETHEREUM_VIA_GRAVITY_BRIDGE } from "@/config/networks";

import useBridgeCombo from "./util";

interface BridgeProps {
  type: "in" | "out";
}
const Bridging = (props: BridgeProps) => {
  const {
    amount,
    setAmount,
    maxBridgeAmount,
    amountCheck,
    canBridge,
    bridgeTx,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    amountAsBigNumberString,
    networkName,
    cosmosProps,
    bridge,
  } = useBridgeCombo(props.type);

  const { fromNetwork, toNetwork, token } = bridge.selections;
  return (
    <>
      <ConfirmationModal
        open={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
        }}
        {...cosmosProps}
        token={{
          name: token?.symbol ?? "",
          url: token?.icon ?? "",
        }}
        imgUrl={
          bridge.direction === "in"
            ? fromNetwork?.icon ?? ""
            : toNetwork?.icon ?? ""
        }
        addresses={{
          from: bridge.addresses.getSender(),
          to: bridge.addresses.getReceiver(),
        }}
        fromNetwork={networkName(fromNetwork)}
        toNetwork={networkName(toNetwork)}
        type={bridge.direction}
        amount={formatBalance(amountAsBigNumberString, token?.decimals ?? 0, {
          symbol: token?.symbol,
          precision: token?.decimals,
          commify: true,
        })}
        confirmation={{
          onConfirm: () => {
            bridgeTx();
          },
          canConfirm: !canBridge.error,
        }}
        extraDetails={
          toNetwork?.id === ETHEREUM_VIA_GRAVITY_BRIDGE.id ? (
            <Text size="x-sm">
              To bridge your tokens to Ethereum through Gravity Bridge, first
              ensure that you have an IBC wallet like Keplr.
              <br />
              <br />
              Next, enter your Gravity Bridge address (from Keplr) below and
              confirm.
              <br />
              <br />
              Once completed, you can transfer your tokens from Gravity Bridge
              to Ethereum using the{" "}
              <a
                style={{ textDecoration: "underline" }}
                href="https://bridge.blockscape.network/"
              >
                Gravity Bridge Portal
              </a>
            </Text>
          ) : undefined
        }
      />

      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          style={{
            flexDirection:
              bridge.direction === "in" ? "column" : "column-reverse",
          }}
        >
          {/* select network group */}

          <Container width="100%" gap={14}>
            {bridge.direction === "in" ? (
              <>
                <Text size="sm">Select Network</Text>

                <Selector
                  label={{
                    text: "From",
                    width: "50px",
                  }}
                  title="SELECT FROM NETWORK"
                  activeItem={
                    fromNetwork ?? {
                      name: "Select network",
                      icon: "loader.svg",
                      id: "",
                    }
                  }
                  items={
                    bridge.direction === "in"
                      ? bridge.allOptions.networks.filter((network) =>
                          isEVMNetwork(network)
                        )!
                      : []
                  }
                  groupedItems={[
                    {
                      main: {
                        name: "Cosmos Networks",
                        icon: "/icons/atom.svg",
                        id: "",
                      },
                      items: bridge.allOptions.networks.filter(
                        (network) => !isEVMNetwork(network)
                      ),
                    },
                  ]}
                  onChange={
                    bridge.direction === "in"
                      ? (networkId) => bridge.setState("network", networkId)
                      : () => false
                  }
                />
              </>
            ) : (
              <>
                <Text size="sm">Select Network</Text>

                <div className={styles["network-box"]}>
                  <Text
                    theme="secondary-dark"
                    size="sm"
                    style={{
                      width: "60px",
                    }}
                  >
                    From
                  </Text>
                  <div className={styles.token}>
                    <Image
                      src={fromNetwork?.icon ?? "loader.svg"}
                      alt={fromNetwork?.name ?? "loading"}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {fromNetwork?.name}
                    </Text>
                  </div>
                </div>
              </>
            )}

            {bridge.direction === "out" ? (
              <Selector
                label={{
                  text: "To",
                  width: "50px",
                }}
                title="SELECT TO NETWORK"
                activeItem={
                  toNetwork ?? {
                    name: "Select network",
                    icon: "loader.svg",
                    id: "",
                  }
                }
                items={
                  bridge.direction === "out" ? bridge.allOptions.networks : []
                }
                onChange={
                  bridge.direction === "out"
                    ? (networkId) => bridge.setState("network", networkId)
                    : () => false
                }
              />
            ) : (
              <div className={styles["network-box"]}>
                <Text
                  theme="secondary-dark"
                  size="sm"
                  style={{
                    width: "60px",
                  }}
                >
                  To
                </Text>

                <div className={styles.token}>
                  <Image
                    src={toNetwork?.icon ?? "loader.svg"}
                    alt={toNetwork?.name ?? "loading"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    {toNetwork?.name}
                  </Text>
                </div>
              </div>
            )}
          </Container>
          <Spacer height="20px" />
          {/* select token group */}

          <Container width="100%" gap={14}>
            <Text size="sm">Select Token and Enter Amount</Text>
            <Container width="100%" direction="row" gap={20}>
              <Selector
                title="SELECT TOKEN"
                activeItem={
                  token
                    ? {
                        ...token,
                        name:
                          token.name.length > 24 ? token.symbol : token.name,
                      }
                    : {
                        name: "Select Token",
                        icon: "loader.svg",
                        id: "",
                      }
                }
                items={bridge.allOptions.tokens
                  .map((token) => ({
                    ...token,
                    name: token.name.length > 24 ? token.symbol : token.name,
                    secondary: displayAmount(
                      token.balance ?? "0",
                      token.decimals
                    ),
                  }))
                  .sort((a, b) => {
                    if (Number(a.secondary) === Number(b.secondary)) {
                      return b.name.toLowerCase() > a.name.toLowerCase()
                        ? -1
                        : 1;
                    }
                    return Number(a.secondary) > Number(b.secondary) ? -1 : 1;
                  })}
                onChange={(tokenId) => bridge.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={maxBridgeAmount}
                  decimals={token?.decimals ?? 0}
                  placeholder="0.0"
                  value={amount}
                  onChange={(val) => {
                    setAmount(val.target.value);
                  }}
                  className={styles["input"]}
                  error={amountCheck.error && Number(amount) !== 0}
                  errorMessage={amountCheck.error ? amountCheck.reason : ""}
                />
              </Container>
            </Container>
          </Container>
          {/* <Text size="sm">Select Method</Text>
          <Selector
            title="SELECT METHOD"
            activeItem={{
              name: getBridgeMethodInfo(method).name,
              id: method ?? "0",
              icon: getBridgeMethodInfo(method).icon,
            }}
            items={hook.allOptions.methods.map((method) => ({
              name: getBridgeMethodInfo(method).name,
              id: method,
              icon: getBridgeMethodInfo(method).icon,
            }))}
            onChange={(method) =>
              hook.setters.method(method as BridgingMethod)
            }
          /> */}
        </div>

        <Spacer height="20px" />
        <Button
          width="fill"
          onClick={() => {
            setIsConfirmationModalOpen(true);
          }}
          disabled={amountCheck.error}
        >
          {bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;
