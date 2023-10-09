"use client";
import Button from "@/components/button/button";
import Text from "@/components/text";
import Input from "@/components/input/input";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
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
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { areEqualAddresses } from "@/utils/address.utils";
import { convertTokenAmountToNote } from "@/utils/tokens/tokenMath.utils";
interface Props {
  isSupplyModal: boolean;
  cToken: CTokenWithUserData | null;
  position: UserLMPosition;
  transaction: {
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    validateAmount: (
      amount: string,
      txType: CTokenLendingTxTypes
    ) => ValidationReturn;
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
        <Card
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
      {isSupply &&
        (Number(cToken.supplyApy) !== 0 || Number(cToken.distApy) !== 0) && (
          <>
            <Card name="Supply APR" value={cToken.supplyApy + "%"} />
            <Card name="Dist APR" value={cToken.distApy + "%"} />
          </>
        )}
      {!isSupply && (
        <>
          <Card name="Borrow APR" value={cToken.borrowApy + "%"} />
        </>
      )}
      <Card
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
      validateAmount: (
        amount: string,
        txType: CTokenLendingTxTypes
      ) => ValidationReturn;
      performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    }
  ) {
    const [amount, setAmount] = useState("");
    const bnAmount = (
      convertToBigNumber(amount, cToken.underlying.decimals).data ?? "0"
    ).toString();
    const amountCheck = transaction.validateAmount(bnAmount, actionType);
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

        <Container width="100%" gap={20}>
          <APRs cToken={cToken} isSupply={isSupplyModal} />
          <Balances
            cToken={cToken}
            isSupply={isSupplyModal}
            liquidityLeft={position.liquidity}
          />
        </Container>
        <Spacer height="70px" />
        <div
          style={{
            width: "100%",
          }}
        >
          <Input
            type="amount"
            balance={maxAmountForLendingTx(actionType, cToken, position)}
            decimals={cToken.underlying.decimals}
            onChange={(val) => {
              setAmount(val.target.value);
            }}
            placeholder="0.0"
            value={amount}
            error={!amountCheck.isValid && Number(amount) !== 0}
            errorMessage={amountCheck.errorMessage}
          />
          <Spacer height="20px" />
          <Button
            width={"fill"}
            disabled={!amountCheck.isValid}
            onClick={() => transaction.performTx(bnAmount, actionType)}
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

const Card = ({
  name,
  value,
  note,
}: {
  name: string;
  value: string;
  note?: boolean;
}) => (
  <Container direction="row" gap="auto">
    <Text size="sm" font="proto_mono">
      {name}
    </Text>
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
