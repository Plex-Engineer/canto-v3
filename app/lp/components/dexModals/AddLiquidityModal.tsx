"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import { convertToBigNumber } from "@/utils/formatting";
import { useState } from "react";
import Container from "@/components/container/container";
import { getOptimalValueBFormatted } from "@/utils/cantoDex";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { Validation } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import styles from "./cantoDex.module.scss";
import Amount from "@/components/amount/amount";
import { ModalItem } from "@/app/lending/components/modal/modal";
import Toggle from "@/components/toggle";
import { areEqualAddresses } from "@/utils/address";
import PopUp from "@/components/popup/popup";
import { CantoDexTxTypes } from "@/transactions/pairs/cantoDex";

interface AddLiquidityProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: AddTxParams) => Validation;
  sendTxFlow: (params: AddTxParams) => void;
}
export const AddLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: AddLiquidityProps) => {
  // values
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("10");
  const [willStake, setWillStake] = useState(true);
  const [valueToken1, setValueToken1] = useState("");
  const [valueToken2, setValueToken2] = useState("");

  // set values based on optimization
  async function setValue(value: string, token1: boolean) {
    let optimalAmount;
    if (token1) {
      setValueToken1(value);
      optimalAmount = await getOptimalValueBFormatted({
        chainId: Number(pair.token1.chainId),
        pair,
        valueChanged: 1,
        amount: value,
      });
    } else {
      setValueToken2(value);
      optimalAmount = await getOptimalValueBFormatted({
        chainId: Number(pair.token1.chainId),
        pair,
        valueChanged: 2,
        amount: value,
      });
    }
    if (optimalAmount.error) {
      token1 ? setValueToken2("") : setValueToken1("");
      return;
    }
    token1
      ? setValueToken2(optimalAmount.data)
      : setValueToken1(optimalAmount.data);
  }

  // validation
  const paramCheck = validateParams({
    pair,
    value1: (
      convertToBigNumber(valueToken1, pair.token1.decimals).data ?? "0"
    ).toString(),
    value2: (
      convertToBigNumber(valueToken2, pair.token2.decimals).data ?? "0"
    ).toString(),
    willStake,
    slippage,
    deadline,
  });

  // speical function to display correct symbol if wcanto
  const tokenSymbol = (token: {
    chainId: number;
    address: string;
    symbol: string;
  }) => {
    const wcantoAddress = getCantoCoreAddress(Number(token.chainId), "wcanto");
    return areEqualAddresses(token.address, wcantoAddress ?? "")
      ? "CANTO"
      : token.symbol;
  };

  return (
    <Container margin="sm">
      <div className={styles.iconTitle}>
        <Icon icon={{ url: pair.logoURI, size: 60 }} />
        <Text size="lg" font="proto_mono">
          {pair.symbol}
        </Text>
      </div>
      <Spacer height="10px" />
      <Amount
        decimals={pair.token1.decimals}
        value={valueToken1}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        IconUrl={pair.token1.logoURI}
        title={tokenSymbol(pair.token1)}
        min="1"
        max={pair.token1.balance ?? "0"}
        symbol={tokenSymbol(pair.token1)}
      />

      <Spacer height="20px" />

      <Amount
        decimals={pair.token2.decimals}
        value={valueToken2}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        IconUrl={pair.token2.logoURI}
        title={tokenSymbol(pair.token2)}
        min="1"
        max={pair.token2.balance ?? "0"}
        symbol={tokenSymbol(pair.token2)}
      />
      <Spacer height="20px" />
      <Container className={styles.card}>
        <ModalItem
          name="Slippage"
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={40}
              direction="row"
              style={{
                width: "120px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                placeholder={Number(slippage).toString()}
                value={Number(slippage).toString()}
                onChange={(e) => setSlippage(Number(e.target.value))}
                error={Number(slippage) > 100 || Number(slippage) < 0}
              />
              <Text>%</Text>
            </Container>
          }
        />
        <ModalItem
          name="Deadline"
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={10}
              direction="row"
              style={{
                width: "120px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                placeholder={Number(deadline).toString()}
                value={Number(deadline).toString()}
                onChange={(e) => setDeadline(e.target.value)}
                error={Number(deadline) <= 0}
              />
              <Text>mins</Text>
            </Container>
          }
        />
      </Container>

      <Container
        direction="row"
        gap={"auto"}
        width="fill"
        style={{
          padding: "16px 0",
        }}
      >
        <div></div>
        <Container
          direction="row"
          gap={12}
          center={{
            vertical: true,
          }}
        >
          <Text size="sm" font="proto_mono">
            Stake
          </Text>
          <div>
            <PopUp
              content={
                <Text>
                  To receive rewards you&apos;ll need to stake your LP tokens.
                </Text>
              }
              width="300px"
            >
              {/* <Icon
        icon={{
          url: "/check.svg",
          size: 24,
        }}
      /> */}
              <span className={styles.infoPop}>
                <Text
                  theme="secondary-dark"
                  size="sm"
                  style={{
                    textAlign: "right",
                  }}
                >
                  ?
                </Text>
              </span>
            </PopUp>
          </div>
          <Toggle onChange={(value) => setWillStake(value)} value={willStake} />
        </Container>
      </Container>

      <Button
        disabled={paramCheck.error}
        width={"fill"}
        onClick={() =>
          sendTxFlow({
            pair,
            value1: (
              convertToBigNumber(valueToken1, pair.token1.decimals).data ?? "0"
            ).toString(),
            value2: (
              convertToBigNumber(valueToken2, pair.token2.decimals).data ?? "0"
            ).toString(),
            willStake,
            slippage,
            deadline,
          })
        }
      >
        {paramCheck.error ? paramCheck.reason : "Add Liquidity"}
      </Button>
      <Spacer height="20px" />
    </Container>
  );
}; // Functions to create correct parameters for transactions (add/remove liquidity)

interface AddTxParams {
  pair: CantoDexPairWithUserCTokenData;
  value1: string;
  value2: string;
  willStake: boolean;
  slippage: number;
  deadline: string;
}
export const createAddParams = (params: AddTxParams) => ({
  pair: params.pair,
  slippage: params.slippage,
  deadline: params.deadline,
  txType: CantoDexTxTypes.ADD_LIQUIDITY,
  amounts: {
    amount1: params.value1,
    amount2: params.value2,
  },
  stake: params.willStake,
});
