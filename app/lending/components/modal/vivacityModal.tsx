"use client";
import Button from "@/components/button/button";
import Text from "@/components/text";
import styles from "./modal.module.scss";
import Tabs from "@/components/tabs/tabs";
import Image from "next/image";
import Container from "@/components/container/container";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/formatting";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import React, { useEffect, useState } from "react";
import { Validation } from "@/config/interfaces";
import Amount from "@/components/amount/amount";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address";
import { convertTokenAmountToNote, percentOfAmount } from "@/utils/math";
import { Vivacity } from "@/transactions/lending";
import Analytics from "@/provider/analytics";
import BigNumber from "bignumber.js";
interface Props {
  isSupplyModal: boolean;
  cToken: Vivacity.VCNoteWithUserData | null;
  transaction: {
    validateParams: (
      amount: string,
      txType: Vivacity.CTokenLendingTxTypes,
      max: boolean
    ) => Validation;
    performTx: (
      amount: string,
      txType: Vivacity.CTokenLendingTxTypes,
      max: boolean
    ) => void;
  };
}

export const VivacityModal = (props: Props) => {
  const Balances = ({ cToken }: { cToken: Vivacity.VCNoteWithUserData }) => {
    // if the token is not $Note, show the balances in terms of note as well
    const cNoteAddress = getCantoCoreAddress(
      cToken.userDetails?.chainId ?? 0,
      "cNote"
    );
    const isNote = areEqualAddresses(cToken.address, cNoteAddress ?? "");
    return (
      <Container className={styles.card} padding="md" width="100%">
        <CTokenAmountCard
          name="Wallet Balance"
          amount={cToken.userDetails?.balanceOfUnderlying ?? "0"}
          decimals={cToken.underlying.decimals}
          symbol={cToken.underlying.symbol}
          note={isNote}
          price={cToken.price}
        />
        <CTokenAmountCard
          name="Supplied Amount"
          amount={cToken.userDetails?.supplyBalanceInUnderlying ?? "0"}
          decimals={cToken.underlying.decimals}
          symbol={cToken.underlying.symbol}
          note={isNote}
          price={cToken.price}
        />
      </Container>
    );
  };

  const APRs = ({ cToken }: { cToken: Vivacity.VCNoteWithUserData }) => {
    return (
      <Container className={styles.card} padding="md" width="100%">
        <ModalItem name="Supply APR" value={cToken.supplyApy + "%"} />
      </Container>
    );
  };

  function Content(
    cToken: Vivacity.VCNoteWithUserData,
    isSupplyModal: boolean,
    actionType: Vivacity.CTokenLendingTxTypes,
    transaction: {
      validateParams: (
        amount: string,
        txType: Vivacity.CTokenLendingTxTypes,
        max: boolean
      ) => Validation;
      performTx: (
        amount: string,
        txType: Vivacity.CTokenLendingTxTypes,
        max: boolean
      ) => void;
    }
  ) {
    const [maxClicked, setMaxClicked] = useState(false);
    const [amount, setAmount] = useState("");
    const [cTokenAmount, setCTokenAmount] = useState("");

    const bnAmount = (
      convertToBigNumber(amount, cToken.underlying.decimals).data ?? "0"
    ).toString();

    const bnCTokenAmount = new BigNumber(cTokenAmount)
      .multipliedBy(new BigNumber(10).pow(cToken.decimals))
      .integerValue(BigNumber.ROUND_UP)
      .toString();

    // tx params
    const txParams: [string, Vivacity.CTokenLendingTxTypes, boolean] = [
      actionType === Vivacity.CTokenLendingTxTypes.SUPPLY
        ? bnAmount
        : bnCTokenAmount,
      actionType,
      maxClicked,
    ];

    // check params
    const paramCheck = transaction.validateParams(...txParams);

    // limits
    const maxAmount = Vivacity.maxAmountForLendingTxModal(actionType, cToken);
    // show limit if borrowing or withdrawing
    const limits =
      actionType === Vivacity.CTokenLendingTxTypes.WITHDRAW
        ? [90, 94, 98, 100]
        : null;
    const limitProps = limits
      ? { limit: { limit: maxAmount, limitName: "Limit" } }
      : {};

    useEffect(() => {
      const cTokenAmount = Vivacity.getVCNoteAmountFromNote(
        amount,
        cToken.exchangeRate
      );
      setCTokenAmount(cTokenAmount);
    }, [amount]);
    return (
      <div className={styles.content} key={cToken.address + isSupplyModal}>
        <Spacer height="20px" />
        <Image
          src={cToken.underlying.logoURI}
          width={50}
          height={50}
          alt={"Transaction"}
        />
        <Spacer height="10px" />

        <Text font="proto_mono" size="lg">
          {cToken.underlying.symbol}
        </Text>
        <Spacer height="20px" />

        <Amount
          decimals={cToken.underlying.decimals}
          value={amount}
          onChange={(val, wasMax) => {
            wasMax ? setMaxClicked(true) : setMaxClicked(false);
            setAmount(val.target.value);
          }}
          IconUrl={cToken.underlying.logoURI}
          title={cToken.underlying.symbol}
          max={maxAmount}
          maxName="Lending Market Modal"
          min="1"
          symbol={cToken.underlying.symbol}
          {...limitProps}
          extraNode={
            limits ? (
              <BorrowLimits
                maxBorrow={maxAmount}
                currentAmount={amount}
                setAmount={setAmount}
                limits={limits}
                decimals={cToken.underlying.decimals}
              />
            ) : undefined
          }
        />
        <Spacer height="20px" />

        <Container width="100%" gap={20}>
          <APRs cToken={cToken} />
          <Balances cToken={cToken} />
        </Container>
        <div
          style={{
            width: "100%",
          }}
        >
          <Spacer height="20px" />
          <Button
            width={"fill"}
            disabled={paramCheck.error}
            onClick={() => transaction.performTx(...txParams)}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {props.cToken ? (
        <>
          <Tabs
            tabs={[
              {
                title: "Supply",
                content: Content(
                  props.cToken,
                  true,
                  Vivacity.CTokenLendingTxTypes.SUPPLY,
                  props.transaction
                ),
              },
              {
                title: "withdraw",
                content: Content(
                  props.cToken,
                  true,
                  Vivacity.CTokenLendingTxTypes.WITHDRAW,
                  props.transaction
                ),
              },
            ]}
          />
        </>
      ) : (
        <Text>No Active Token</Text>
      )}
    </div>
  );
};

export const ModalItem = ({
  name,
  value,
  note,
}: {
  name: string;
  value: string | React.ReactNode;
  note?: boolean;
}) => (
  <Container
    direction="row"
    gap="auto"
    center={{
      vertical: true,
    }}
  >
    <Text size="sm" font="proto_mono">
      {name}
    </Text>
    {typeof value === "string" ? (
      <Text size="sm" font="proto_mono">
        {value}{" "}
        <span>
          {note && (
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 14,
              }}
            />
          )}
        </span>
      </Text>
    ) : (
      value
    )}
  </Container>
);

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
        {displayAmount(amount, decimals, {
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

const BorrowLimits = ({
  maxBorrow,
  currentAmount,
  setAmount,
  limits,
  decimals,
}: {
  maxBorrow: string;
  currentAmount: string;
  setAmount: (amount: string) => void;
  limits: number[];
  decimals: number;
}) => {
  return (
    <Container gap={20} direction="row">
      {limits.map((limit) => {
        const limitAmount =
          limit == 100
            ? formatBalance(maxBorrow, decimals, { precision: decimals })
            : formatBalance(
                percentOfAmount(maxBorrow, limit).data ?? "0",
                decimals,
                { precision: decimals }
              );

        return (
          <Text
            font="proto_mono"
            role="button"
            key={limit}
            size="x-sm"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              opacity: limitAmount === currentAmount ? 1 : 0.5,
            }}
            onClick={() => {
              Analytics.actions.events.lendingMarket.limitClicked(limit);
              setAmount(limitAmount);
            }}
          >{`${limit}%`}</Text>
        );
      })}
    </Container>
  );
};
