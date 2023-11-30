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
import { percentOfAmount, validateWeiUserInputTokenAmount } from "@/utils/math";
import { ETHEREUM_VIA_GRAVITY_BRIDGE } from "@/config/networks";
import { BridgingMethod } from "@/transactions/bridge";
import { getGravityChainFeeInPercent } from "@/transactions/bridge/gravityBridge/gravityFees";

interface BridgeProps {
  hook: BridgeHookReturn;
  params: {
    signer: GetWalletClientResult | undefined;
    transactionStore?: TransactionStore;
  };
}
const Bridging = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  const [maxBridgeAmount, setMaxBridgeAmount] = useState<string>("0");

  // FEES FOR GRAVITY BRIDGE
  const [gravityChainFeePercent, setGravityChainFeePercent] = useState<
    number | null
  >(null);
  const [gravityBridgeFee, setGravityBridgeFee] = useState<string | null>(null);

  // get gravity chain fee onload
  useEffect(() => {
    async function gravityChainFee() {
      const { data } = await getGravityChainFeeInPercent();
      setGravityChainFeePercent(data);
    }
    gravityChainFee();
  }, []);

  // big number amount
  const amountAsBigNumberString = (
    convertToBigNumber(amount, props.hook.selections.token?.decimals ?? 18)
      .data ?? "0"
  ).toString();

  // validate user input amount
  const amountCheck = validateWeiUserInputTokenAmount(
    amountAsBigNumberString,
    "1",
    maxBridgeAmount,
    props.hook.selections.token?.symbol ?? "",
    props.hook.selections.token?.decimals ?? 0
  );

  useEffect(() => {
    async function getMaxAmount() {
      setMaxBridgeAmount(
        await maxBridgeAmountInUnderlying(
          props.hook.selections.token,
          props.hook.selections.toNetwork?.id ?? ""
        )
      );
    }
    getMaxAmount();
  }, [
    props.hook.selections.token?.id,
    props.hook.selections.toNetwork?.id,
    props.hook.selections.token?.balance,
  ]);

  const txParams = {
    amount: amountAsBigNumberString,
    bridgeFee: gravityBridgeFee ?? undefined,
    chainFee:
      percentOfAmount(
        amountAsBigNumberString,
        gravityChainFeePercent ?? 0
      ).data?.toString() ?? undefined,
  };

  // transaction that will do the bridging
  async function bridgeTx() {
    // get flow
    const flow = props.hook.bridge.newBridgeFlow(txParams);
    // add flow to store
    props.params.transactionStore?.addNewFlow({
      txFlow: flow,
      signer: props.params.signer,
      onSuccessCallback: () => setIsConfirmationModalOpen(false),
    });
  }

  // check to see if bridging will be possible with the current parameters
  const canBridge = props.hook.bridge.validateParams(txParams);

  // if confirmation is open
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // cosmos address props
  const cosmosProps =
    props.hook.selections.method === BridgingMethod.IBC &&
    props.hook.direction === "out" &&
    props.hook.selections.toNetwork &&
    isCosmosNetwork(props.hook.selections.toNetwork)
      ? {
          cosmosAddress: {
            addressName:
              props.hook.selections.toNetwork.id ===
              ETHEREUM_VIA_GRAVITY_BRIDGE.id
                ? "Gravity Bridge"
                : undefined,
            chainId: props.hook.selections.toNetwork.chainId,
            addressPrefix: props.hook.selections.toNetwork.addressPrefix,
            currentAddress: props.hook.addresses.getReceiver() ?? "",
            setAddress: (address: string) =>
              props.hook.setState("inputCosmosAddress", address),
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
            name: props.hook.selections.token?.symbol ?? "",
            url: props.hook.selections.token?.icon ?? "",
          }}
          imgUrl={
            props.hook.direction === "in"
              ? props.hook.selections.fromNetwork?.icon ?? ""
              : props.hook.selections.toNetwork?.icon ?? ""
          }
          addresses={{
            from: props.hook.addresses.getSender(),
            to: props.hook.addresses.getReceiver(),
          }}
          fromNetwork={networkName(props.hook.selections.fromNetwork)}
          toNetwork={networkName(props.hook.selections.toNetwork)}
          type={props.hook.direction}
          amount={formatBalance(
            amountAsBigNumberString,
            props.hook.selections.token?.decimals ?? 0,
            {
              symbol: props.hook.selections.token?.symbol,
              precision: props.hook.selections.token?.decimals,
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
            props.hook.selections.toNetwork?.id ===
            ETHEREUM_VIA_GRAVITY_BRIDGE.id ? (
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
              props.hook.direction === "in" ? "column" : "column-reverse",
          }}
        >
          {/* select network group */}

          <Container width="100%" gap={14}>
            {props.hook.direction === "in" ? (
              <>
                <Text size="sm">Select Network</Text>

                <Selector
                  label={{
                    text: "From",
                    width: "50px",
                  }}
                  title="SELECT FROM NETWORK"
                  activeItem={
                    props.hook.selections.fromNetwork ?? {
                      name: "Select network",
                      icon: "loader.svg",
                      id: "",
                    }
                  }
                  items={
                    props.hook.direction === "in"
                      ? props.hook.allOptions.networks.filter((network) =>
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
                      items: props.hook.allOptions.networks.filter(
                        (network) => !isEVMNetwork(network)
                      ),
                    },
                  ]}
                  onChange={
                    props.hook.direction === "in"
                      ? (networkId) => props.hook.setState("network", networkId)
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
                      src={
                        props.hook.selections.fromNetwork?.icon ?? "loader.svg"
                      }
                      alt={props.hook.selections.fromNetwork?.name ?? "loading"}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {props.hook.selections.fromNetwork?.name}
                    </Text>
                  </div>
                </div>
              </>
            )}

            {props.hook.direction === "out" ? (
              <Selector
                label={{
                  text: "To",
                  width: "50px",
                }}
                title="SELECT TO NETWORK"
                activeItem={
                  props.hook.selections.toNetwork ?? {
                    name: "Select network",
                    icon: "loader.svg",
                    id: "",
                  }
                }
                items={
                  props.hook.direction === "out"
                    ? props.hook.allOptions.networks
                    : []
                }
                onChange={
                  props.hook.direction === "out"
                    ? (networkId) => props.hook.setState("network", networkId)
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
                    src={props.hook.selections.toNetwork?.icon ?? "loader.svg"}
                    alt={props.hook.selections.toNetwork?.name ?? "loading"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    {props.hook.selections.toNetwork?.name}
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
                  props.hook.selections.token
                    ? {
                        ...props.hook.selections.token,
                        name:
                          props.hook.selections.token.name.length > 24
                            ? props.hook.selections.token.symbol
                            : props.hook.selections.token.name,
                      }
                    : {
                        name: "Select Token",
                        icon: "loader.svg",
                        id: "",
                      }
                }
                items={props.hook.allOptions.tokens
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
                onChange={(tokenId) => props.hook.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={maxBridgeAmount}
                  decimals={props.hook.selections.token?.decimals ?? 0}
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
              name: getBridgeMethodInfo(props.hook.selections.method).name,
              id: props.hook.selections.method ?? "0",
              icon: getBridgeMethodInfo(props.hook.selections.method).icon,
            }}
            items={props.hook.allOptions.methods.map((method) => ({
              name: getBridgeMethodInfo(method).name,
              id: method,
              icon: getBridgeMethodInfo(method).icon,
            }))}
            onChange={(method) =>
              props.hook.setters.method(method as BridgingMethod)
            }
          /> */}
        </div>

        <Spacer height="20px" />
        {props.hook.direction === "out" &&
          props.hook.selections.method === BridgingMethod.GRAVITY_BRIDGE && (
            <div>
              chain fee percent: {gravityChainFeePercent}%{" "}
              {`(${percentOfAmount(
                amountAsBigNumberString,
                gravityChainFeePercent ?? 0
              ).data?.toString()})`}
            </div>
          )}
        <Spacer height="20px" />
        <Button
          width="fill"
          onClick={() => {
            setIsConfirmationModalOpen(true);
          }}
          disabled={amountCheck.error}
        >
          {props.hook.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;
