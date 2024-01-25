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
import { convertTokenAmountToNote, percentOfAmount } from "@/utils/math";
import { CTokenLendingTxTypes } from "@/transactions/lending";
import Toggle from "@/components/toggle";
import Analytics from "@/provider/analytics";

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
          value={displayAmount(liquidityLeft, 18)}
          note
        />
      </Container>
    );
  };

  const APRs = ({
    cToken,
    isSupply,
    transaction,
  }: {
    cToken: CTokenWithUserData;
    isSupply: boolean;
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
  }) => {
    const isCollateral = cToken.userDetails?.isCollateral ?? false;
    const collateralParams: [string, CTokenLendingTxTypes, boolean] = [
      cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
      isCollateral
        ? CTokenLendingTxTypes.DECOLLATERALIZE
        : CTokenLendingTxTypes.COLLATERALIZE,
      false,
    ];
    const collateralTxValidation = transaction.validateParams(
      ...collateralParams
    );

    return (
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

        <>
          <ModalItem
            name="Collateral Factor"
            value={
              <Container
                direction="row"
                gap={10}
                center={{
                  vertical: true,
                  horizontal: true,
                }}
              >
                <Text font="proto_mono" size="sm">
                  {displayAmount(cToken.collateralFactor, 16) + "%"}
                </Text>
              </Container>
            }
          />
          {isSupply && (
            <ModalItem
              name="Collateral"
              value={
                <Container
                  direction="row"
                  gap={10}
                  center={{
                    vertical: true,
                    horizontal: true,
                  }}
                >
                  <Toggle
                    onChange={() => {
                      transaction.performTx(...collateralParams);
                    }}
                    value={cToken.userDetails?.isCollateral ?? false}
                    disabled={collateralTxValidation.error}
                  />
                </Container>
              }
            />
          )}
        </>
      </Container>
    );
  };

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
    // show limit if borrowing or withdrawing
    const limits =
      actionType === CTokenLendingTxTypes.BORROW
        ? [90, 94, 98]
        : actionType === CTokenLendingTxTypes.WITHDRAW
          ? [90, 94, 98, 100]
          : null;
    const limitProps = limits
      ? {
          limit: {
            limit:
              actionType === CTokenLendingTxTypes.BORROW
                ? percentOfAmount(maxAmount, 98.8).data
                : maxAmount,
            limitName: "Limit",
          },
        }
      : {};

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
          <APRs
            cToken={cToken}
            isSupply={isSupplyModal}
            transaction={transaction}
          />
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
        const limitAmount = formatBalance(
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
