"use client";
import Button from "@/components/button/button";
import Text from "@/components/text";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import styles from "./modal.module.scss";
import Tabs from "@/components/tabs/tabs";
import Image from "next/image";
import Container from "@/components/container/container";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import { useState } from "react";
import { ValidationReturn } from "@/config/interfaces";
import Amount from "@/components/amount/amount";
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
  }) => (
    <Container className={styles.card} padding="md" width="100%">
      <ModalItem
        name="Wallet Balance"
        value={formatBalance(
          cToken.userDetails?.balanceOfUnderlying ?? "0",
          cToken.underlying.decimals,
          {
            commify: true,
            symbol: cToken.underlying.symbol,
          }
        )}
      />
      {isSupply && (
        <ModalItem
          name="Supplied Amount"
          value={formatBalance(
            cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
            cToken.underlying.decimals,
            {
              commify: true,
              symbol: cToken.underlying.symbol,
            }
          )}
        />
      )}
      {!isSupply && (
        <ModalItem
          name="Borrowed Amount"
          value={formatBalance(
            cToken.userDetails?.borrowBalance ?? "0",
            cToken.underlying.decimals,
            {
              commify: true,
              symbol: cToken.underlying.symbol,
            }
          )}
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

        <Amount
          decimals={cToken.underlying.decimals}
          value={amount}
          onChange={(val) => {
            setAmount(val.target.value);
          }}
          IconUrl={cToken.underlying.logoURI}
          title={cToken.symbol}
          max={maxAmountForLendingTx(actionType, cToken, position)}
          symbol={cToken.symbol}
          error={!amountCheck.isValid && Number(amount) !== 0}
          errorMessage={amountCheck.errorMessage}
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

export const ModalItem = ({
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
