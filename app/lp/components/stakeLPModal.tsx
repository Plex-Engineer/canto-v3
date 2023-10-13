"use client";
import Button from "@/components/button/button";
import Text from "@/components/text";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import styles from "./modal.module.scss";
import Tabs from "@/components/tabs/tabs";
import Image from "next/image";
import Container from "@/components/container/container";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import { useState } from "react";
import { ValidationReturn } from "@/config/interfaces";
import Amount from "@/components/amount/amount";
import { CantoDexTxTypes } from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import {
  addTokenBalances,
  convertTokenAmountToNote,
} from "@/utils/tokens/tokenMath.utils";
import { ModalItem } from "@/app/lending/components/modal/modal";
interface Props {
  clpToken: CTokenWithUserData;
  onBack: () => void;
  transaction: {
    performTx: (
      amountLP: string,
      txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE
    ) => void;
    validateAmount: (
      amount: string,
      txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE
    ) => ValidationReturn;
  };
}

export const StakeLPModal = (props: Props) => {
  // get total values to decide what can be done with tokens
  const totalLP = addTokenBalances(
    props.clpToken.userDetails?.supplyBalanceInUnderlying ?? "0",
    props.clpToken.userDetails?.balanceOfUnderlying ?? "0"
  );

  const CLMInfo = ({ cToken }: { cToken: CTokenWithUserData }) => (
    <Container width="100%" gap={20}>
      <Container className={styles.card} padding="md" width="100%">
        <ModalItem name="Staking APR" value={cToken.distApy + "%"} />
      </Container>
      <Container className={styles.card} padding="md" width="100%">
        <CTokenAmountCard
          name="Unstaked Balance"
          amount={cToken.userDetails?.balanceOfUnderlying ?? "0"}
          decimals={cToken.underlying.decimals}
          symbol={""}
          price={cToken.price}
        />
        <CTokenAmountCard
          name="Staked Balance"
          amount={cToken.userDetails?.supplyBalanceInUnderlying ?? "0"}
          decimals={cToken.underlying.decimals}
          symbol={""}
          price={cToken.price}
        />
      </Container>
    </Container>
  );

  function Content(
    cLPToken: CTokenWithUserData,
    transaction: {
      performTx: (
        amountLP: string,
        txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE
      ) => void;
      validateAmount: (
        amount: string,
        txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE
      ) => ValidationReturn;
    },
    txType: CantoDexTxTypes.STAKE | CantoDexTxTypes.UNSTAKE
  ) {
    const [amount, setAmount] = useState("");
    const bnAmount = (
      convertToBigNumber(amount, cLPToken.underlying.decimals).data ?? "0"
    ).toString();
    const amountCheck = transaction.validateAmount(bnAmount, txType);
    const maxAmount =
      (txType === CantoDexTxTypes.STAKE
        ? cLPToken.userDetails?.balanceOfUnderlying
        : cLPToken.userDetails?.supplyBalanceInUnderlying) ?? "0";
    return (
      <div className={styles.content}>
        <Spacer height="20px" />
        <Image
          src={cLPToken.underlying.logoURI}
          width={50}
          height={50}
          alt={"Transaction"}
        />
        <Spacer height="10px" />

        <Text font="proto_mono" size="lg">
          {cLPToken.underlying.symbol}
        </Text>
        <Spacer height="20px" />

        <Amount
          decimals={cLPToken.underlying.decimals}
          value={amount}
          onChange={(val) => {
            setAmount(val.target.value);
          }}
          IconUrl={cLPToken.underlying.logoURI}
          title={cLPToken.underlying.symbol}
          max={maxAmount}
          symbol={cLPToken.underlying.symbol}
          error={!amountCheck.isValid && Number(amount) !== 0}
          errorMessage={amountCheck.errorMessage}
        />
        <Spacer height="40px" />
        <CLMInfo cToken={cLPToken} />
        <div
          style={{
            width: "100%",
          }}
        >
          <Spacer height="20px" />
          <Button
            width={"fill"}
            disabled={!amountCheck.isValid}
            onClick={() => transaction.performTx(bnAmount, txType)}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div
        style={{
          height: "100%",
        }}
      >
        <Container
          direction="row"
          height="50px"
          center={{
            vertical: true,
          }}
          style={{
            padding: "0 16px",
            cursor: "pointer",
            marginTop: "-14px",
          }}
          onClick={props.onBack}
        >
          <div
            style={{
              rotate: "90deg",
              marginRight: "6px",
            }}
          >
            <Icon icon={{ url: "./dropdown.svg", size: 24 }} />
          </div>
          <Text font="proto_mono" size="lg">
            Stake
          </Text>
        </Container>
        <div>
          <Tabs
            tabs={[
              {
                title: "Stake",
                content: Content(
                  props.clpToken,
                  props.transaction,
                  CantoDexTxTypes.STAKE
                ),
              },
              {
                title: "Unstake",
                content: Content(
                  props.clpToken,
                  props.transaction,
                  CantoDexTxTypes.UNSTAKE
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const CTokenAmountCard = ({
  name,
  amount,
  decimals,
  symbol,
  note,
  price,
}: {
  name: string;
  amount: string;
  decimals: number;
  symbol: string;
  note?: boolean;
  price?: string;
}) => {
  const { data: valueInNote } =
    price && !note
      ? convertTokenAmountToNote(amount, price)
      : { data: undefined };

  return (
    <Container direction="row" gap="auto">
      <Text size="sm" font="proto_mono">
        {name}
      </Text>
      <Text size="sm" font="proto_mono">
        {formatBalance(amount, decimals, {
          commify: true,
          symbol: note ? undefined : symbol,
        })}
        {valueInNote ? ` (${displayAmount(valueInNote.toString(), 18)} ` : " "}
        <span>
          {(note || valueInNote) && (
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 14,
              }}
            />
          )}
        </span>
        {valueInNote ? ")" : ""}
      </Text>
    </Container>
  );
};
