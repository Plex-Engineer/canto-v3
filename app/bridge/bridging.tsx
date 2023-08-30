"use client";
import Spacer from "@/components/layout/spacer";
import Selector, { Item } from "@/components/selector/selector";
import Text from "@/components/text";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import { TransactionStore } from "@/stores/transactionStore";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useState } from "react";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";

interface BridgeProps {
  hook: BridgeHookReturn;
  params: {
    signer: any;
    transactionStore?: TransactionStore;
  };
}
const Bridging = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  //? BRIDGE TEST
  async function bridgeTx() {
    props.hook.bridge
      .bridgeTx({
        amount: convertToBigNumber(
          amount,
          props.hook.selections.token?.decimals ?? 18
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
          ethAccount: props.params.signer.address,
          signer: props.params.signer,
        });
      });
  }

  const { data: canBridge } = props.hook.bridge.canBridge({
    amount: convertToBigNumber(
      amount,
      props.hook.selections.token?.decimals ?? 18
    ).data.toString(),
  });

  return (
    <>
      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          style={{
            flexDirection:
              props.hook.direction === "in" ? "column" : "column-reverse",
          }}
        >
          <Container width="100%" gap={14}>
            <Text size="sm">{`From network (${props.hook.addresses.getSender()})`}</Text>
            <Selector
              title="SELECT FROM NETWORK"
              activeItem={
                props.hook.selections.fromNetwork ?? {
                  name: "Select network",
                  icon: "",
                  id: "",
                }
              }
              items={
                props.hook.direction === "in"
                  ? props.hook.allOptions.networks
                  : []
              }
              onChange={
                props.hook.direction === "in"
                  ? (networkId) => props.hook.setState("network", networkId)
                  : () => false
              }
            />

            <Text size="sm">{`To network (${props.hook.addresses.getReceiver()})`}</Text>
            <Selector
              title="SELECT TO NETWORK"
              activeItem={
                props.hook.selections.toNetwork ?? {
                  name: "Select network",
                  icon: "",
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
          </Container>
          <Container width="100%" gap={10}>
            <Text size="sm">Select Token</Text>
            <Container width="100%" direction="row" gap={20}>
              <Selector
                title="SELECT TOKEN"
                activeItem={
                  props.hook.selections.token
                    ? {
                        ...props.hook.selections.token,
                      }
                    : ({
                        name: "Select Token",
                        icon: "",
                        id: "",
                      } as Item)
                }
                items={
                  props.hook.allOptions.tokens.map((token) => ({
                    ...token,
                    balance: formatBalance(
                      token.balance ?? "0",
                      token.decimals
                    ),
                  })) ?? []
                }
                onChange={(tokenId) => props.hook.setState("token", tokenId)}
              />
              <Input
                type="amount"
                placeholder="0.0"
                value={amount}
                onChange={(val) => {
                  setAmount(val.target.value);
                }}
                className={styles["input"]}
                error={
                  Number(amount) >
                  Number(
                    formatBalance(
                      props.hook.selections.token?.balance ?? "0",
                      props.hook.selections.token?.decimals ?? 18,
                      {
                        precision: 0,
                        commify: true,
                        symbol: props.hook.selections.token?.symbol,
                      }
                    )
                  )
                }
                errorMessage={`"Amount must be less than " ${formatBalance(
                  props.hook.selections.token?.balance ?? "0",
                  props.hook.selections.token?.decimals ?? 18,
                  {
                    precision: 0,
                    commify: true,
                    symbol: props.hook.selections.token?.symbol,
                  }
                )}`}
              />
            </Container>
          </Container>
          {/* <Text size="sm">Select Method</Text>
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
          /> */}
        </div>
        <Spacer height="100px" />

        {/* <Input
          type="amount"
          placeholder="0.0"
          value={amount}
          onChange={(val) => {
            setAmount(val.target.value);
          }}
          className={styles["input"]}
          error={
            Number(amount) >
            Number(
              formatBalance(
                props.bridge.selections.token?.balance ?? "0",
                props.bridge.selections.token?.decimals ?? 18,
                {
                  precision: 0,
                  commify: true,
                  symbol: props.bridge.selections.token?.symbol,
                }
              )
            )
          }
          errorMessage={`"Amount must be less than " ${formatBalance(
            props.bridge.selections.token?.balance ?? "0",
            props.bridge.selections.token?.decimals ?? 18,
            {
              precision: 0,
              commify: true,
              symbol: props.bridge.selections.token?.symbol,
            }
          )}`}
        /> */}
        <Spacer height="100px" />
        {/* <input
          placeholder="cosmos receiver address"
          onChange={(e) => setInputCosmosAddress(e.target.value)}
        /> */}
        <Spacer height="100px" />
        <Button width="fill" onClick={bridgeTx}>
          {props.hook.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
          {` ::can bridge: ${
            canBridge !== null ? (canBridge ? "yes" : "no") : "no"
          }`}
        </Button>
      </section>
    </>
  );
};

export default Bridging;
