"use client";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useTransactionStore, {
  TransactionStore,
} from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
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
import Selector, { Item } from "../components/selector/selector";
import {
  BridgingMethod,
  getBridgeMethodInfo,
} from "@/hooks/bridge/interfaces/bridgeMethods";
import {
  getNetworkInfoFromChainId,
  isCosmosNetwork,
} from "@/utils/networks.utils";
import { TransactionFlowWithStatus } from "@/config/interfaces/transactions";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";

export default function TestPage() {
  const [onTestnet, setOnTestnet] = useState<boolean>(false);
  const [txIndex, setTxIndex] = useState<number>(0);
  const [direction, setDirection] = useState<"in" | "out">("in");
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({
    testnet: onTestnet,
  });
  const bridgeIn = useBridgeIn({
    testnet: onTestnet,
  });
  const transactionStore = useStore(useTransactionStore, (state) => state);

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      if (!network || !isCosmosNetwork(network)) return;
      const keplrClient = await connectToKeplr(network);
      bridgeIn.setState("cosmosAddress", keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    const { data: network, error } = getNetworkInfoFromChainId(
      signer?.chain.id ?? 1
    );
    if (error) {
      console.log(error);
      return;
    }
    setOnTestnet(network.isTestChain);
  }, [signer?.chain.id]);

  useEffect(() => {
    // set the signer address
    bridgeIn.setState("ethAddress", signer?.account.address);
    bridgeOut.setState("ethAddress", signer?.account.address);
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
    transactionStore?: TransactionStore;
  };
}
const Bridge = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");

  async function bridgeTest() {
    props.bridge.bridge
      .bridgeTx({
        amount: convertToBigNumber(
          amount,
          props.bridge.selections.token?.decimals ?? 18
        ).data.toString(),
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
      <label>{`From network (${props.bridge.addresses.getSender()})`}</label>
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
            ? (val) => props.bridge.setState("network", val)
            : () => false
        }
      />
      <label>{`To network (${props.bridge.addresses.getReceiver()})`}</label>
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
            ? (val) => props.bridge.setState("network", val)
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
          props.bridge.selections.token
            ? {
                ...props.bridge.selections.token,
              }
            : ({
                name: "Select Token",
                icon: "",
                id: "",
              } as Item)
        }
        items={
          props.bridge.allOptions.tokens.map((token) => ({
            ...token,
            balance: formatBalance(token.balance ?? "0", token.decimals),
          })) ?? []
        }
        onChange={(val) => props.bridge.setState("token", val)}
      />
      <Spacer height="10px" />
      Balance:{" "}
      {formatBalance(
        props.bridge.selections.token?.balance ?? "0",
        props.bridge.selections.token?.decimals ?? 18,
        {
          precision: 0,
          commify: true,
          symbol: props.bridge.selections.token?.symbol,
        }
      )}
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
  const { data: canBridge } = props.bridge.bridge.canBridge({
    amount,
  });
  console.log(canBridge);
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
              props.bridge.setState("method", method as BridgingMethod)
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
          onChange={(e) =>
            props.bridge.setState("inputCosmosAddress", e.target.value)
          }
        />
        <Spacer height="100px" />
        <Button width="fill" onClick={bridgeTest}>
          {props.bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
          {` ::can bridge: ${
            canBridge !== null ? (canBridge ? "yes" : "no") : "no"
          }`}
        </Button>
      </section>
    </>
  );
};
