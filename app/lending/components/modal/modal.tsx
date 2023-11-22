"use client";
import Button from "@/components/button/button";
import Text from "@/components/text";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
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
import React, { useState } from "react";
import { Validation } from "@/config/interfaces";
import Amount from "@/components/amount/amount";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address";
import { convertTokenAmountToNote } from "@/utils/math";
import { CTokenLendingTxTypes } from "@/transactions/lending";
interface Props {
  isSupplyModal: boolean;
  cToken: CTokenWithUserData | null;
  position: UserLMPosition;
  transaction: {
    validateParams: (
      amount: string,
      txType: CTokenLendingTxTypes,
      max: boolean
    ) => Validation;
    performTx: (
      amount: string,
      txType: CTokenLendingTxTypes,
      max: boolean
    ) => void;
  };
}

export const LendingModal = (props: Props) => {
  const Balances = ({
    cToken,
    isSupply,
    liquidityLeft,
  }: {
    cToken: CTokenWithUserData;
    isSupply: boolean;
    liquidityLeft: string;
  }) => {
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
        {isSupply && (
          <CTokenAmountCard
            name="Supplied Amount"
            amount={cToken.userDetails?.supplyBalanceInUnderlying ?? "0"}
            decimals={cToken.underlying.decimals}
            symbol={cToken.underlying.symbol}
            note={isNote}
            price={cToken.price}
          />
        )}
        {!isSupply && (
          <CTokenAmountCard
            name="Borrowed Amount"
            amount={cToken.userDetails?.borrowBalance ?? "0"}
            decimals={cToken.underlying.decimals}
            symbol={cToken.underlying.symbol}
            note={isNote}
            price={cToken.price}
          />
        )}
        <ModalItem
          name="Account Liquidity Remaining"
          value={formatBalance(liquidityLeft, 18, {
            commify: true,
          })}
          note
        />
      </Container>
    );
  };

  const APRs = ({
    cToken,
    isSupply,
  }: {
    cToken: CTokenWithUserData;
    isSupply: boolean;
  }) => (
    <Container className={styles.card} padding="md" width="100%">
      {/* might need to change this in future for showing it on more tokens */}
      {isSupply && cToken.symbol.toLowerCase() == "cnote" && (
        <>
          <ModalItem name="Supply APR" value={cToken.supplyApy + "%"} />
          <ModalItem name="Dist APR" value={cToken.distApy + "%"} />
        </>
      )}

      {!isSupply && (
        <>
          <ModalItem name="Borrow APR" value={cToken.borrowApy + "%"} />
        </>
      )}
      <ModalItem
        name="Collateral Factor"
        value={formatBalance(cToken.collateralFactor, 16) + "%"}
      />
    </Container>
  );

  function Content(
    cToken: CTokenWithUserData,
    isSupplyModal: boolean,
    actionType: CTokenLendingTxTypes,
    position: UserLMPosition,
    transaction: {
      validateParams: (
        amount: string,
        txType: CTokenLendingTxTypes,
        max: boolean
      ) => Validation;
      performTx: (
        amount: string,
        txType: CTokenLendingTxTypes,
        max: boolean
      ) => void;
    }
  ) {
    const [maxClicked, setMaxClicked] = useState(false);
    const [amount, setAmount] = useState("");
    const bnAmount = (
      convertToBigNumber(amount, cToken.underlying.decimals).data ?? "0"
    ).toString();

    // tx params
    const txParams: [string, CTokenLendingTxTypes, boolean] = [
      bnAmount,
      actionType,
      maxClicked,
    ];

    // check params
    const paramCheck = transaction.validateParams(...txParams);

    // limits
    const maxAmount = maxAmountForLendingTx(actionType, cToken, position, 100);
    const limitAmount = maxAmountForLendingTx(actionType, cToken, position, 90);
    // if withdrawing and nothing is borrowed no need for limit
    const needLimit =
      actionType === CTokenLendingTxTypes.BORROW ||
      (actionType === CTokenLendingTxTypes.WITHDRAW &&
        Number(limitAmount) <
          Number(cToken.userDetails?.supplyBalanceInUnderlying) &&
        Number(position.totalBorrow) !== 0);
    const limitProps = needLimit
      ? { limit: { limit: limitAmount, limitName: "90% limit" } }
      : {};

    return (
      <div className={styles.content}>
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
          min="1"
          symbol={cToken.underlying.symbol}
          {...limitProps}
        />
        <Spacer height="40px" />

        <Container width="100%" gap={20}>
          <APRs cToken={cToken} isSupply={isSupplyModal} />
          <Balances
            cToken={cToken}
            isSupply={isSupplyModal}
            liquidityLeft={position.liquidity}
          />
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
            tabs={
              props.isSupplyModal
                ? [
                    {
                      title: "Supply",
                      content: Content(
                        props.cToken,
                        true,
                        CTokenLendingTxTypes.SUPPLY,
                        props.position,
                        props.transaction
                      ),
                    },
                    {
                      title: "withdraw",
                      content: Content(
                        props.cToken,
                        true,
                        CTokenLendingTxTypes.WITHDRAW,
                        props.position,
                        props.transaction
                      ),
                    },
                  ]
                : [
                    {
                      title: "Borrow",
                      content: Content(
                        props.cToken,
                        false,
                        CTokenLendingTxTypes.BORROW,
                        props.position,
                        props.transaction
                      ),
                    },
                    {
                      title: "Repay",
                      content: Content(
                        props.cToken,
                        false,
                        CTokenLendingTxTypes.REPAY,
                        props.position,
                        props.transaction
                      ),
                    },
                  ]
            }
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
