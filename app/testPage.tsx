"use client";
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
import { useWalletClient } from "wagmi";
import Text from "@/components/text";
import styles from "./bridge/bridge.module.scss";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Tabs from "@/components/tabs/tabs";
import Selector from "./selector/selector";
import {
  bridgeMethodToIcon,
  bridgeMethodToString,
  BridgingMethod,
} from "@/hooks/bridge/interfaces/bridgeMethods";
import { isCosmosNetwork } from "@/utils/networks.utils";

export default function TestPage() {
  const [txIndex, setTxIndex] = useState<number>(0);
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
      if (!network || !isCosmosNetwork(network)) return;
      const keplrClient = await connectToKeplr(network);
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
      <Spacer height="100px" />
      <div
        style={{
          border: "solid blue 5px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          TRANSACTIONS{" "}
          <Button onClick={() => transactionStore?.clearTransactions()}>
            CLEAR ALL TRANSACTIONS
          </Button>
          <Button
            color={"accent"}
            onClick={() =>
              transactionStore?.performTransactions(signer, {
                txListIndex: txIndex,
              })
            }
          >
            RETRY TRANSACTION
          </Button>
        </h1>
        <ul>
          {transactionStore?.transactions[txIndex]?.map((tx, idx) => (
            <div key={idx}>
              <li>tx - {idx}</li>
              <li>
                {idx}- description: {tx.tx.description}
              </li>
              <li>
                {idx}- status: {tx.status}
              </li>
              <li>
                {idx}-{" "}
                <a
                  href={tx.txLink}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  link
                </a>
              </li>
            </div>
          ))}
        </ul>
        <Spacer height="30px" />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Button
            onClick={() => {
              if (txIndex !== 0) setTxIndex((prev) => prev - 1);
            }}
          >
            Backward
          </Button>
          <Spacer width="20px" />
          <Text>Current page: {txIndex + 1}</Text>
          <Spacer width="20px" />
          <Button
            onClick={() => {
              if (txIndex !== transactionStore?.transactions.length - 1)
                setTxIndex((prev) => prev + 1);
            }}
          >
            Forward
          </Button>
        </div>
      </div>
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

  const networkSelectors = (
    <>
      <label>From Network</label>
      <Selector
        title="SELECT FROM NETWORK"
        activeItem={props.bridge.selections.fromNetwork}
        items={
          props.bridge.direction === "in"
            ? props.bridge.allOptions.networks
            : []
        }
        onChange={
          props.bridge.direction === "in"
            ? props.bridge.setters.network
            : () => false
        }
      />
      <label>To Network</label>
      <Selector
        title="SELECT TO NETWORK"
        activeItem={props.bridge.selections.toNetwork}
        items={
          props.bridge.direction === "out"
            ? props.bridge.allOptions.networks
            : []
        }
        onChange={
          props.bridge.direction === "out"
            ? props.bridge.setters.network
            : () => false
        }
      />
    </>
  );
  const tokenSelector = (
    <>
      <Text size="sm">Select Token</Text>
      <Selector
        title="SELECT TOKEN"
        activeItem={props.bridge.selections.token}
        items={props.bridge.allOptions.tokens}
        onChange={props.bridge.setters.token}
      />
    </>
  );

  const orderedSelectors =
    props.bridge.direction === "in" ? (
      <>
        {networkSelectors}
        {tokenSelector}
      </>
    ) : (
      <>
        {tokenSelector}
        {networkSelectors}
      </>
    );
  return (
    <>
      <section className={styles.container}>
        <div className={styles["network-selection"]}>
          {orderedSelectors}
          <Text size="sm">Select Method</Text>
          <Selector
            title="SELECT METHOD"
            activeItem={{
              name: bridgeMethodToString(props.bridge.selections.method),
              id: props.bridge.selections.method,
              icon: bridgeMethodToIcon(props.bridge.selections.method),
            }}
            items={props.bridge.allOptions.methods.map((method) => ({
              name: bridgeMethodToString(method),
              id: method,
              icon: bridgeMethodToIcon(method),
            }))}
            onChange={props.bridge.setters.method}
          />
        </div>
        <Spacer height="100px" />
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
