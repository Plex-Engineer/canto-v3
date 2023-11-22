"use client";
import Spacer from "@/components/layout/spacer";
import Selector, { Item } from "@/components/selector/selector";
import Text from "@/components/text";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import { TransactionStore } from "@/stores/transactionStore";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/formatting";
import { useEffect, useState } from "react";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";
import Image from "next/image";
import Modal from "@/components/modal/modal";
import ConfirmationModal from "./components/confirmationModal";
import { isCosmosNetwork, isEVMNetwork } from "@/utils/networks";
import { GetWalletClientResult } from "wagmi/actions";
import { maxBridgeAmountInUnderlying } from "@/hooks/bridge/helpers/amounts";
import { BaseNetwork } from "@/config/interfaces";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { ETHEREUM_VIA_GRAVITY_BRIDGE } from "@/config/networks";
import { BridgingMethod } from "@/transactions/bridge";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useBridgeCombo from "./util";

interface BridgeProps {
  type: "in" | "out";
}
const Bridging = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  const [maxBridgeAmount, setMaxBridgeAmount] = useState<string>("0");

  const {
    bridgeIn,
    bridgeOut,
    signer,
    txStore: transactionStore,
  } = useBridgeCombo();

  const hook = props.type === "in" ? bridgeIn : bridgeOut;
  // big number amount
  const amountAsBigNumberString = (
    convertToBigNumber(amount, hook.selections.token?.decimals ?? 18).data ??
    "0"
  ).toString();

  // validate user input amount
  const amountCheck = validateWeiUserInputTokenAmount(
    amountAsBigNumberString,
    "1",
    maxBridgeAmount,
    hook.selections.token?.symbol ?? "",
    hook.selections.token?.decimals ?? 0
  );

  useEffect(() => {
    async function getMaxAmount() {
      setMaxBridgeAmount(
        await maxBridgeAmountInUnderlying(
          hook.selections.token,
          hook.selections.toNetwork?.id ?? ""
        )
      );
    }
    getMaxAmount();
  }, [
    hook.selections.token?.id,
    hook.selections.toNetwork?.id,
    hook.selections.token?.balance,
    hook.selections.token,
  ]);

  // transaction that will do the bridging
  async function bridgeTx() {
    // get flow
    const flow = hook.bridge.newBridgeFlow({
      amount: amountAsBigNumberString,
    });
    // add flow to store
    transactionStore?.addNewFlow({
      txFlow: flow,
      signer: signer,
      onSuccessCallback: () => setIsConfirmationModalOpen(false),
    });
  }

  // check to see if bridging will be possible with the current parameters
  const canBridge = hook.bridge.validateParams({
    amount: amountAsBigNumberString,
  });

  // if confirmation is open
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // cosmos address props
  const cosmosProps =
    hook.selections.method === BridgingMethod.IBC &&
    hook.direction === "out" &&
    hook.selections.toNetwork &&
    isCosmosNetwork(hook.selections.toNetwork)
      ? {
          cosmosAddress: {
            addressName:
              hook.selections.toNetwork.id === ETHEREUM_VIA_GRAVITY_BRIDGE.id
                ? "Gravity Bridge"
                : undefined,
            chainId: hook.selections.toNetwork.chainId,
            addressPrefix: hook.selections.toNetwork.addressPrefix,
            currentAddress: hook.addresses.getReceiver() ?? "",
            setAddress: (address: string) =>
              hook.setState("inputCosmosAddress", address),
          },
        }
      : {};

  // get network name to display in modal
  const networkName = (network: BaseNetwork | null) => {
    if (network) {
      if (isCosmosNetwork(network) && network.altName) {
        return network.altName;
      }
      return network.name;
    }
    return "";
  };
  return (
    <>
      <Modal
        open={isConfirmationModalOpen}
        width="30rem"
        height="min-content"
        onClose={() => {
          setIsConfirmationModalOpen(false);
        }}
      >
        <ConfirmationModal
          {...cosmosProps}
          token={{
            name: hook.selections.token?.symbol ?? "",
            url: hook.selections.token?.icon ?? "",
          }}
          imgUrl={
            hook.direction === "in"
              ? hook.selections.fromNetwork?.icon ?? ""
              : hook.selections.toNetwork?.icon ?? ""
          }
          addresses={{
            from: hook.addresses.getSender(),
            to: hook.addresses.getReceiver(),
          }}
          fromNetwork={networkName(hook.selections.fromNetwork)}
          toNetwork={networkName(hook.selections.toNetwork)}
          type={hook.direction}
          amount={formatBalance(
            amountAsBigNumberString,
            hook.selections.token?.decimals ?? 0,
            {
              symbol: hook.selections.token?.symbol,
              precision: hook.selections.token?.decimals,
              commify: true,
            }
          )}
          confirmation={{
            onConfirm: () => {
              bridgeTx();
            },
            canConfirm: !canBridge.error,
          }}
          extraDetails={
            hook.selections.toNetwork?.id === ETHEREUM_VIA_GRAVITY_BRIDGE.id ? (
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
      </Modal>
      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          style={{
            flexDirection:
              hook.direction === "in" ? "column" : "column-reverse",
          }}
        >
          {/* select network group */}

          <Container width="100%" gap={14}>
            {hook.direction === "in" ? (
              <>
                <Text size="sm">Select Network</Text>

                <Selector
                  label={{
                    text: "From",
                    width: "50px",
                  }}
                  title="SELECT FROM NETWORK"
                  activeItem={
                    hook.selections.fromNetwork ?? {
                      name: "Select network",
                      icon: "loader.svg",
                      id: "",
                    }
                  }
                  items={
                    hook.direction === "in"
                      ? hook.allOptions.networks.filter((network) =>
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
                      items: hook.allOptions.networks.filter(
                        (network) => !isEVMNetwork(network)
                      ),
                    },
                  ]}
                  onChange={
                    hook.direction === "in"
                      ? (networkId) => hook.setState("network", networkId)
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
                      src={hook.selections.fromNetwork?.icon ?? "loader.svg"}
                      alt={hook.selections.fromNetwork?.name ?? "loading"}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {hook.selections.fromNetwork?.name}
                    </Text>
                  </div>
                </div>
              </>
            )}

            {hook.direction === "out" ? (
              <Selector
                label={{
                  text: "To",
                  width: "50px",
                }}
                title="SELECT TO NETWORK"
                activeItem={
                  hook.selections.toNetwork ?? {
                    name: "Select network",
                    icon: "loader.svg",
                    id: "",
                  }
                }
                items={hook.direction === "out" ? hook.allOptions.networks : []}
                onChange={
                  hook.direction === "out"
                    ? (networkId) => hook.setState("network", networkId)
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
                    src={hook.selections.toNetwork?.icon ?? "loader.svg"}
                    alt={hook.selections.toNetwork?.name ?? "loading"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    {hook.selections.toNetwork?.name}
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
                  hook.selections.token
                    ? {
                        ...hook.selections.token,
                        name:
                          hook.selections.token.name.length > 24
                            ? hook.selections.token.symbol
                            : hook.selections.token.name,
                      }
                    : {
                        name: "Select Token",
                        icon: "loader.svg",
                        id: "",
                      }
                }
                items={hook.allOptions.tokens
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
                onChange={(tokenId) => hook.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={maxBridgeAmount}
                  decimals={hook.selections.token?.decimals ?? 0}
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
              name: getBridgeMethodInfo(hook.selections.method).name,
              id: hook.selections.method ?? "0",
              icon: getBridgeMethodInfo(hook.selections.method).icon,
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
          {hook.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;
