import Spacer from "@/components/layout/spacer";
import Selector, { Item } from "@/components/selector/selector";
import Text from "@/components/text";
import {
  BridgingMethod,
  getBridgeMethodInfo,
} from "@/hooks/bridge/interfaces/bridgeMethods";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import { TransactionStore } from "@/stores/transactionStore";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useEffect, useState } from "react";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";

interface BridgeProps {
  hook: BridgeHookReturn;
  params: {
    signer: any;
    cosmosAddress: string;
    cantoAddress: string;
    transactionStore?: TransactionStore;
  };
}
const Bridging = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  const [inputCosmosAddress, setInputCosmosAddress] = useState<string>("");
  const [fromAddress, setFromAddress] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");

  // SET FROM AND TO ADDRESSES BASED ON BRIDGE METHOD
  useEffect(() => {
    switch (props.hook.selections.method) {
      case BridgingMethod.GRAVITY_BRIDGE:
        setFromAddress(props.params.signer?.account.address);
        setToAddress(props.params.cantoAddress);
        return;
      case BridgingMethod.IBC:
        if (props.hook.direction === "in") {
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
    props.hook.selections.method,
    props.params.signer?.account.address,
    inputCosmosAddress,
    props.params.cosmosAddress,
    props.params.cantoAddress,
    props.hook.direction,
  ]);

  //? BRIDGE TEST
  async function bridgeTest() {
    props.hook.bridge
      .bridgeTx({
        sender: fromAddress,
        receiver: toAddress,
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
          signer: props.params.signer,
        });
      });
  }

  const networkSelectors = (
    <>
      <Text size="sm">{`From network (${fromAddress})`}</Text>
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
          props.hook.direction === "in" ? props.hook.allOptions.networks : []
        }
        onChange={
          props.hook.direction === "in"
            ? props.hook.setters.network
            : () => false
        }
      />

      <Text size="sm">{`To network (${toAddress})`}</Text>
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
          props.hook.direction === "out" ? props.hook.allOptions.networks : []
        }
        onChange={
          props.hook.direction === "out"
            ? props.hook.setters.network
            : () => false
        }
      />
    </>
  );

  const tokenSelector = (
    <Container width="100%" gap={10}>
      <Text size="sm">Select Token</Text>
      <Container width="100%" direction="row" gap={10}>
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
              balance: formatBalance(token.balance ?? "0", token.decimals),
            })) ?? []
          }
          onChange={props.hook.setters.token}
        />
        <Spacer height="10px" />
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
      {/* Balance:{" "}
      {formatBalance(
        props.bridge.selections.token?.balance ?? "0",
        props.bridge.selections.token?.decimals ?? 18,
        {
          precision: 0,
          commify: true,
          symbol: props.bridge.selections.token?.symbol,
        }
      )} */}
    </Container>
  );

  const orderedSelectors =
    props.hook.direction === "in" ? (
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
  const { data: canBridge } = props.hook.bridge.canBridge({
    sender: fromAddress,
    receiver: toAddress,
    amount,
  });

  return (
    <>
      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          //   style={{
          //     flexDirection:
          //       props.hook.direction === "in" ? "column" : "column-reverse",
          //   }}
        >
          {orderedSelectors}

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
        <Button width="fill" onClick={bridgeTest}>
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
