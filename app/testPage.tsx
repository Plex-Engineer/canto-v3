"use client";
import { getAllUserBridgeTransactionHistory } from "@/hooks/bridge/txHistory";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useStaking from "@/hooks/staking/useStaking";
import useTransactionStore, {
  TransactionStore,
} from "@/stores/transactionStore";
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
import Selector, { Item } from "./selector/selector";
import {
  BridgingMethod,
  getBridgeMethodInfo,
} from "@/hooks/bridge/interfaces/bridgeMethods";
import { isCosmosNetwork } from "@/utils/networks.utils";
import { TransactionFlowWithStatus } from "@/config/interfaces/transactions";

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
    testnet: true,
    userEthAddress: signer?.account.address,
    userCosmosAddress: cosmosAddress,
  });
  const transactionStore = useStore(useTransactionStore, (state) => state);
  console.log(transactionStore?.transactionFlows);

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
      if (!signer?.account.address) return;
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
        <TxBox flow={transactionStore?.transactionFlows[txIndex]} />
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
          <Text>
            Current page: {txIndex + 1}{" "}
            {"  Title: " + transactionStore?.transactionFlows?.[txIndex]?.title}
          </Text>
          <Spacer width="20px" />
          <Button
            onClick={() => {
              if (
                transactionStore &&
                txIndex !== transactionStore.transactionFlows.length - 1
              )
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
interface TxBoxProps {
  flow?: TransactionFlowWithStatus;
}
const TxBox = ({ flow }: TxBoxProps) => {
  if (!flow || !flow.title) return <></>;
  return (
    <div>
      <h1>title: {flow.title}</h1>
      <h3>status: {flow.status}</h3>
      <ul>
        {flow.transactions.map((tx, idx) => (
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
              <a href={tx.txLink} style={{ cursor: "pointer", color: "blue" }}>
                link
              </a>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

interface BridgeProps {
  bridge: BridgeHookReturn;
  params: {
    signer: any;
    cosmosAddress: string;
    cantoAddress: string;
    transactionStore?: TransactionStore;
  };
}
const Bridge = (props: BridgeProps) => {
  console.log(props.bridge.selections);
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  const [inputCosmosAddress, setInputCosmosAddress] = useState<string>("");
  const [fromAddress, setFromAddress] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");

  useEffect(() => {
    switch (props.bridge.selections.method) {
      case BridgingMethod.GRAVITY_BRIDGE:
        setFromAddress(props.params.signer?.account.address);
        setToAddress(props.params.cantoAddress);
        return;
      case BridgingMethod.IBC:
        if (props.bridge.direction === "in") {
          setFromAddress(props.params.cosmosAddress);
          setToAddress(props.params.signer?.account.address);
        } else {
          setFromAddress(props.params.signer?.account.address);
          setToAddress(inputCosmosAddress);
        }
        return;
      case BridgingMethod.LAYER_ZERO:
        setFromAddress(props.params.signer?.account.address);
        setToAddress(props.params.signer?.account.address);
        return;
    }
  }, [
    props.bridge.selections.method,
    props.params.signer?.account.address,
    inputCosmosAddress,
    props.params.cosmosAddress,
    props.params.cantoAddress,
    props.bridge.direction,
  ]);

  async function bridgeTest() {
    props.bridge
      .bridge({
        sender: fromAddress,
        receiver: toAddress,
        amount,
      })
      .then((val) => {
        if (val.error) {
          console.log(val.error);
          return;
        }
        props.params.transactionStore?.addTransactions({
          title: "bridge",
          txList: val.data,
          signer: props.params.signer,
        });
      });
  }

  const networkSelectors = (
    <>
      <label>{`From network (${fromAddress})`}</label>
      <Selector
        title="SELECT FROM NETWORK"
        activeItem={
          props.bridge.selections.fromNetwork ?? {
            name: "Select network",
            icon: "",
            id: "",
          }
        }
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
      <label>{`To network (${toAddress})`}</label>
      <Selector
        title="SELECT TO NETWORK"
        activeItem={
          props.bridge.selections.toNetwork ?? {
            name: "Select network",
            icon: "",
            id: "",
          }
        }
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
        activeItem={
          props.bridge.selections.token ??
          ({
            name: "Select Token",
            icon: "",
            id: "",
          } as Item)
        }
        items={props.bridge.allOptions.tokens ?? []}
        onChange={props.bridge.setters.token}
      />
      <Spacer height="10px" />
      Balance: {props.bridge.selections.token?.balance}
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
              name: getBridgeMethodInfo(props.bridge.selections.method).name,
              id: props.bridge.selections.method ?? "0",
              icon: getBridgeMethodInfo(props.bridge.selections.method).icon,
            }}
            items={props.bridge.allOptions.methods.map((method) => ({
              name: getBridgeMethodInfo(method).name,
              id: method,
              icon: getBridgeMethodInfo(method).icon,
            }))}
            onChange={(method) =>
              props.bridge.setters.method(method as BridgingMethod)
            }
          />
        </div>
        <Spacer height="100px" />
        <input
          placeholder="amount"
          onChange={(e) => setAmount(e.target.value)}
        />
        <Spacer height="100px" />
        <Spacer height="100px" />
        <input
          placeholder="cosmos receiver address"
          onChange={(e) => setInputCosmosAddress(e.target.value)}
        />
        <Spacer height="100px" />
        <Button width="fill" onClick={bridgeTest}>
          {props.bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};
