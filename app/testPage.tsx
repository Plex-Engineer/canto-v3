"use client";
import {
  BridgingMethod,
  bridgeMethodToString,
} from "@/hooks/bridge/interfaces/tokens";
import { getAllUserBridgeTransactionHistory } from "@/hooks/bridge/txHistory";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useStaking from "@/hooks/staking/useStaking";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { ethToCantoAddress } from "@/utils/address.utils";
import { createMsgsClaimStakingRewards } from "@/utils/cosmos/transactions/messages/staking/claimRewards";
import { createMsgsDelegate } from "@/utils/cosmos/transactions/messages/staking/delegate";
import { connectToKeplr } from "@/utils/keplr/connectKeplr";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useWalletClient } from "wagmi";
import Text from "@/components/text";
import styles from "./bridge/bridge.module.scss";
import Image from "next/image";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Button from "@/components/button/button";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";

export default function TestPage() {
  const [direction, setDirection] = useState<"in" | "out">("in");

  const [cosmosAddress, setCosmosAddress] = useState<string>("");
  const [cantoAddress, setCantoAddress] = useState<string>("");
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({
    testnet: false,
    userEthAddress: signer?.account.address,
  });
  const bridgeIn = useBridgeIn({
    testnet: false,
    userEthAddress: signer?.account.address,
    userCosmosAddress: cosmosAddress,
  });
  const transactionStore = useStore(useTransactionStore, (state) => state);
  console.log(transactionStore?.transactions);

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      const keplrClient = await connectToKeplr(bridgeIn.selections.fromNetwork);
      setCosmosAddress(keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    async function getCantoAddress() {
      const cantoAddress = await ethToCantoAddress(signer?.account.address);
      if (cantoAddress.error) {
        console.log(cantoAddress.error);
        return;
      } else {
        setCantoAddress(cantoAddress.data);
      }
    }
    getCantoAddress();
  }, [signer?.account.address]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
      <>
        <AnimatedBackground initSize="400px" direction={direction} time={20} />
        <Container
          height="100vm"
          layer={1}
          backgroundColor="background: var(--card-background-color, #C1C1C1)"
          center={{
            horizontal: true,
            vertical: true,
          }}
        >
          <Container
            height="500px"
            width="700px"
            backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
          >
            <Tabs
              tabs={[
                {
                  title: "BRIDGE IN",
                  content: (
                    <Bridge
                      bridge={bridgeIn}
                      params={{
                        signer: signer,
                        cosmosAddress: cosmosAddress,
                        cantoAddress: cantoAddress,
                        transactionStore: transactionStore,
                      }}
                    />
                  ),
                  onClick: () => setDirection("in"),
                },
                {
                  title: "BRIDGE OUT",
                  content: (
                    <Bridge
                      bridge={bridgeOut}
                      params={{
                        signer: signer,
                        cosmosAddress: cosmosAddress,
                        cantoAddress: cantoAddress,
                        transactionStore: transactionStore,
                      }}
                    />
                  ),
                  onClick: () => setDirection("out"),
                },
                {
                  title: "RECOVERY",
                  isDisabled: true,
                  content: <>recovery</>,
                },
                {
                  title: "TX HISTORY",
                  content: <>tx history</>,
                },
              ]}
            />
          </Container>
        </Container>
      </>

      <button onClick={() => transactionStore?.clearTransactions()}>
        CLEAR ALL TRANSACTIONS
      </button>
      {transactionStore?.transactions.map((txList, idx) => (
        <ul key={idx}>
          <li>txList: {idx}</li>
          {txList.map((tx, idx2) => (
            <ul key={idx2}>
              <li>
                {idx2}- description: {tx.tx.description}
              </li>
              <li>
                {idx2}- status: {tx.status}
              </li>
              <li>
                {idx2}-{" "}
                <a
                  href={tx.txLink}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  link
                </a>
              </li>
              <li>
                <button
                  onClick={() => transactionStore?.clearTransactions(idx)}
                >
                  delete
                </button>
              </li>
            </ul>
          ))}
        </ul>
      ))}
    </div>
  );
}

interface BridgeProps {
  bridge: BridgeHookReturn;
  params: {
    signer: any;
    cosmosAddress: string;
    cantoAddress: string;
    transactionStore?: any;
  };
}
const Bridge = (props: BridgeProps) => {
  const [choosingNetwork, setChoosingNetwork] = useState(false);
  const [choosingToken, setChoosingToken] = useState(false);
  const [choosingMethod, setChoosingMethod] = useState(false);

  function formatParamsBridgeIn(params: {
    ethAddress: string;
    userCosmosAddress: string;
    cantoAddress: string;
    method: BridgingMethod;
    amount: string;
  }) {
    switch (params.method) {
      case BridgingMethod.GRAVITY_BRIDGE:
        return {
          sender: params.ethAddress,
          receiver: params.cantoAddress,
          amount: params.amount,
        };
      case BridgingMethod.IBC:
        return {
          sender: params.userCosmosAddress,
          receiver: params.ethAddress,
          amount: params.amount,
        };
      case BridgingMethod.LAYER_ZERO:
        return {
          sender: params.ethAddress,
          receiver: params.ethAddress,
          amount: params.amount,
        };
    }
  }

  async function bridgeInTest() {
    props.bridge
      .bridge(
        formatParamsBridgeIn({
          ethAddress: props.params.signer?.account.address,
          userCosmosAddress: props.params.cosmosAddress,
          cantoAddress: props.params.cantoAddress,
          method: props.bridge.selections.method,
          amount: "1000",
        })
      )
      .then((val) => {
        if (val.error) {
          console.log(val.error);
          return;
        }
        props.params.transactionStore?.addTransactions(
          val.data,
          props.params.signer
        );
      });
  }

  function formatParamsBridgeOut(params: {
    ethAddress: string;
    userCosmosAddress: string;
    cantoAddress: string;
    method: BridgingMethod;
    amount: string;
  }) {
    switch (params.method) {
      case BridgingMethod.IBC:
        return {
          sender: params.ethAddress,
          receiver: params.userCosmosAddress,
          amount: params.amount,
        };
      case BridgingMethod.LAYER_ZERO:
        return {
          sender: params.ethAddress,
          receiver: params.ethAddress,
          amount: params.amount,
        };
    }
  }

  async function bridgeOutTest() {
    props.bridge
      .bridge(
        formatParamsBridgeOut({
          ethAddress: props.params.signer?.account.address,
          userCosmosAddress: props.params.cosmosAddress,
          cantoAddress: props.params.cantoAddress,
          method: props.bridge.selections.method,
          amount: "1000",
        })
      )
      .then((val) => {
        if (val.error) {
          console.log(val.error);
          return;
        }
        props.params.transactionStore?.addTransactions(
          val.data,
          props.params.signer
        );
      });
  }
  return (
    <>
      <Modal
        open={choosingNetwork}
        onClose={() => {
          setChoosingNetwork(false);
        }}
        width="30rem"
        height="36rem"
      >
        <ul>
          {props.bridge.allOptions.networks.map((network) => (
            <li key={network.id}>
              <Button
                color={
                  (
                    props.bridge.direction === "in"
                      ? network.id === props.bridge.selections?.fromNetwork?.id
                      : network.id === props.bridge.selections?.toNetwork?.id
                  )
                    ? "accent"
                    : "primary"
                }
                icon={{
                  url: network.icon,
                  position: "left",
                }}
                onClick={() => {
                  props.bridge.setters.network(network.id);
                  setChoosingNetwork(false);
                }}
              >
                {network.name}
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={choosingToken}
        onClose={() => setChoosingToken(false)}
        width="30rem"
        height="36rem"
      >
        <Text>Choose a Token</Text>
        <ul>
          {props.bridge.allOptions.tokens.map((token) => (
            <li key={token.id}>
              <Button
                color={
                  token.id === props.bridge.selections.token?.id
                    ? "accent"
                    : "primary"
                }
                icon={{
                  url: token.icon,
                  position: "left",
                }}
                onClick={() => {
                  props.bridge.setters.token(token.id);
                  setChoosingToken(false);
                }}
              >
                {token.name}
                {"  "}
                {formatUnits(BigInt(token.balance ?? 0), token.decimals)}
              </Button>
            </li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={choosingMethod}
        onClose={() => setChoosingMethod(false)}
        width="30rem"
        height="36rem"
      >
        <Text>Choose a Method</Text>
        <ul>
          {props.bridge.allOptions.methods.map((method) => (
            <li key={method}>
              <Button
                color={
                  method === props.bridge.selections.method
                    ? "accent"
                    : "primary"
                }
                onClick={() => {
                  props.bridge.setters.method(method);
                  setChoosingMethod(false);
                }}
              >
                {bridgeMethodToString(method)}
              </Button>
            </li>
          ))}
        </ul>
      </Modal>

      <section className={styles.container}>
        <div className={styles["network-selection"]}>
          <Text size="sm">Select Network</Text>
          <div className={styles["networks-box"]}>
            <Button
              color="secondary"
              height={64}
              width="fill"
              onClick={() => {
                setChoosingNetwork(true);
              }}
            >
              <Container width="50px">
                <Text size="x-sm" theme="secondary-dark">
                  From
                </Text>
              </Container>
              <div className={styles.token}>
                <Image
                  src={props.bridge.selections.fromNetwork?.icon ?? ""}
                  alt={`${props.bridge.selections.fromNetwork?.name} icon`}
                  width={30}
                  height={30}
                />
                <Text size="md" font="proto_mono">
                  {props.bridge.selections.fromNetwork?.name}
                </Text>
              </div>
              <Icon
                icon={{
                  url: "dropdown.svg",
                  size: 24,
                }}
              />
            </Button>
            <div className={styles["network-box"]}>
              <Container width="50px">
                <Text size="x-sm" theme="secondary-dark">
                  To
                </Text>
              </Container>
              <div className={styles.token}>
                <Image
                  src={props.bridge.selections.toNetwork?.icon ?? ""}
                  alt={"canto icon"}
                  width={30}
                  height={30}
                />
                <Text size="md" font="proto_mono">
                  {props.bridge.selections.toNetwork?.name}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <Spacer height="100px" />

        <div className={styles["token-selection"]}>
          <Text size="sm">Select Token</Text>
          <div className={styles["token-box"]}>
            <Container width="50%">
              <Button
                color="secondary"
                width="fill"
                height="large"
                onClick={() => {
                  setChoosingToken(true);
                }}
              >
                <Container
                  width="100%"
                  direction="row"
                  gap={20}
                  center={{
                    vertical: true,
                  }}
                >
                  <Image
                    src={props.bridge.selections.token?.icon ?? ""}
                    alt={"graviton icon"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    {props.bridge.selections.token?.name}
                  </Text>
                </Container>
                <Icon
                  icon={{
                    url: "dropdown.svg",
                    size: 24,
                  }}
                />
              </Button>
            </Container>
          </div>
        </div>
        <Spacer height="100%" />
        <div className={styles["token-selection"]}>
          <Text size="sm">Select Method</Text>
          <div className={styles["token-box"]}>
            <Container width="50%">
              <Button
                color="secondary"
                width="fill"
                height="large"
                onClick={() => {
                  setChoosingMethod(true);
                }}
              >
                <Container
                  width="100%"
                  direction="row"
                  gap={20}
                  center={{
                    vertical: true,
                  }}
                >
                  <Text size="md" font="proto_mono">
                    {bridgeMethodToString(props.bridge.selections.method)}
                  </Text>
                </Container>
                <Icon
                  icon={{
                    url: "dropdown.svg",
                    size: 24,
                  }}
                />
              </Button>
            </Container>
          </div>
        </div>
        <Spacer height="100%" />
        <Button
          width="fill"
          onClick={() => {
            props.bridge.direction === "in" ? bridgeInTest() : bridgeOutTest();
          }}
        >
          {props.bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};
