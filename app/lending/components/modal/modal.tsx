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
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import { useState } from "react";
interface Props {
  isSupplyModal: boolean;
  cToken: CTokenWithUserData | null;
  position: UserLMPosition;
  transaction: {
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    canPerformTx: (amount: string, txType: CTokenLendingTxTypes) => boolean;
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
      <Card
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
        <Card
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
        <Card
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
      <Card
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
      {isSupply && (
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
      canPerformTx: (amount: string, txType: CTokenLendingTxTypes) => boolean;
      performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    }
  ) {
    const [amount, setAmount] = useState("");
    const bnAmount = (
      convertToBigNumber(amount, cToken.underlying.decimals).data ?? "0"
    ).toString();
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
          />
          <Spacer height="20px" />
          <Button
            width={"fill"}
            disabled={!transaction.canPerformTx(bnAmount, actionType)}
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
                      title: "Stake",
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

// function data() {
//   if (selectedToken == null) {
//     return <Text>No Active Token</Text>;
//   }

//   return (
//     <>
//       <Text size="lg" font="proto_mono">
//         {selectedToken.symbol}
//       </Text>
//       <Text size="sm">name: {selectedToken.name}</Text>
//       <Text size="sm">Address: {selectedToken.address}</Text>
//       <Text size="sm">BorrowApy: {selectedToken.borrowApy}</Text>
//       <Text size="sm">BorrowCap: {selectedToken.borrowCap}</Text>
//       <Text size="sm">Cash: {selectedToken.cash}</Text>
//       <Text size="sm">CollateralFactor: {selectedToken.collateralFactor}</Text>
//       <Text size="sm">Decimals: {selectedToken.decimals}</Text>
//       <Text size="sm">DistApy: {selectedToken.distApy}</Text>
//       <Text size="sm">Exchange Rate: {selectedToken.exchangeRate}</Text>
//       <Text size="sm">IsListed: {selectedToken.isListed ? "yes" : "no"}</Text>
//       <Text size="sm">Liquidity: {selectedToken.liquidity}</Text>
//       <Text size="sm">Underlying Price: {selectedToken.price}</Text>
//       <Text size="sm">Supply Apy: {selectedToken.supplyApy}</Text>
//       <h1>----</h1>
//       <Text size="lg" font="proto_mono">
//         Underlying:
//       </Text>
//       <Text size="sm">Address: {selectedToken.underlying.address}</Text>
//       <Text size="sm">Decimals: {selectedToken.underlying.decimals}</Text>
//       <Text size="sm">Symbol: {selectedToken.underlying.symbol}</Text>
//       <Text size="sm">Name: {selectedToken.underlying.name}</Text>
//       <h1>----</h1>
//       <Text size="lg" font="proto_mono">
//         User Data:
//       </Text>
//       <Text size="sm">
//         CToken Balance: {selectedToken.userDetails?.balanceOfCToken}
//       </Text>
//       <Text size="sm">
//         Underlying Balance: {selectedToken.userDetails?.balanceOfUnderlying}
//       </Text>
//       <Text size="sm">
//         Borrow Balance: {selectedToken.userDetails?.borrowBalance}
//       </Text>
//       <Text size="sm">Rewards: {selectedToken.userDetails?.rewards}</Text>
//       <Text size="sm">
//         Is Collateral: {selectedToken.userDetails?.isCollateral ? "yes" : "no"}
//       </Text>
//       <Text size="sm">
//         Supply Balance In Underlying:{" "}
//         {selectedToken.userDetails?.supplyBalanceInUnderlying}
//       </Text>
//       <Text size="sm">
//         Allowance Underlying: {selectedToken.userDetails?.underlyingAllowance}
//       </Text>
//       <Input
//         type="amount"
//         balance={maxAmountForLendingTx(
//           currentAction,
//           selectedToken,
//           clmPosition.position
//         )}
//         decimals={selectedToken.underlying.decimals}
//         value={amount}
//         onChange={(val) => {
//           setAmount(val.target.value);
//         }}
//       />
//       <div style={{ display: "flex", flexDirection: "row" }}>
//         <LendingActionSwitch action={CTokenLendingTxTypes.SUPPLY} />
//         <LendingActionSwitch action={CTokenLendingTxTypes.WITHDRAW} />
//         <LendingActionSwitch action={CTokenLendingTxTypes.BORROW} />
//         <LendingActionSwitch action={CTokenLendingTxTypes.REPAY} />
//       </div>
//       <Button
//         disabled={!transaction.canPerformTx(amount, currentAction)}
//         onClick={() => transaction.performTx(amount, currentAction)}
//       >
//         CONFIRM
//       </Button>
//     </>
//   );
// }
