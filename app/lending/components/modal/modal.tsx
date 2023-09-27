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
import { formatBalance } from "@/utils/tokenBalances.utils";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
interface Props {
  selectedToken: CTokenWithUserData | null;
  transaction: {
    performTx: (amount: string, txType: CTokenLendingTxTypes) => void;
    canPerformTx: (amount: string, txType: CTokenLendingTxTypes) => boolean;
  };
  currentAction: CTokenLendingTxTypes;
  setCurrentAction: (action: CTokenLendingTxTypes) => void;
  amount: string;
  setAmount: (amount: string) => void;
  clmPosition: {
    position: UserLMPosition;
    general: {
      maxAccountLiquidity: string;
      outstandingDebt: string;
      percentLimitUsed: string;
      netApr: string;
    };
  };
}

interface LSProps {
  action: CTokenLendingTxTypes;
}
export const LendingModal = ({
  selectedToken,
  transaction,
  currentAction,
  setCurrentAction,
  amount,
  setAmount,
  clmPosition,
}: Props) => {
  const LendingActionSwitch = ({ action }: LSProps) => (
    <Button
      color={action === currentAction ? "accent" : "primary"}
      onClick={() => setCurrentAction(action)}
    >
      {action}
    </Button>
  );

  function data() {
    if (selectedToken == null) {
      return <Text>No Active Token</Text>;
    }

    return (
      <>
        <Text size="lg" font="proto_mono">
          {selectedToken.symbol}
        </Text>
        <Text size="sm">name: {selectedToken.name}</Text>
        <Text size="sm">Address: {selectedToken.address}</Text>
        <Text size="sm">BorrowApy: {selectedToken.borrowApy}</Text>
        <Text size="sm">BorrowCap: {selectedToken.borrowCap}</Text>
        <Text size="sm">Cash: {selectedToken.cash}</Text>
        <Text size="sm">
          CollateralFactor: {selectedToken.collateralFactor}
        </Text>
        <Text size="sm">Decimals: {selectedToken.decimals}</Text>
        <Text size="sm">DistApy: {selectedToken.distApy}</Text>
        <Text size="sm">Exchange Rate: {selectedToken.exchangeRate}</Text>
        <Text size="sm">IsListed: {selectedToken.isListed ? "yes" : "no"}</Text>
        <Text size="sm">Liquidity: {selectedToken.liquidity}</Text>
        <Text size="sm">Underlying Price: {selectedToken.price}</Text>
        <Text size="sm">Supply Apy: {selectedToken.supplyApy}</Text>
        <h1>----</h1>
        <Text size="lg" font="proto_mono">
          Underlying:
        </Text>
        <Text size="sm">Address: {selectedToken.underlying.address}</Text>
        <Text size="sm">Decimals: {selectedToken.underlying.decimals}</Text>
        <Text size="sm">Symbol: {selectedToken.underlying.symbol}</Text>
        <Text size="sm">Name: {selectedToken.underlying.name}</Text>
        <h1>----</h1>
        <Text size="lg" font="proto_mono">
          User Data:
        </Text>
        <Text size="sm">
          CToken Balance: {selectedToken.userDetails?.balanceOfCToken}
        </Text>
        <Text size="sm">
          Underlying Balance: {selectedToken.userDetails?.balanceOfUnderlying}
        </Text>
        <Text size="sm">
          Borrow Balance: {selectedToken.userDetails?.borrowBalance}
        </Text>
        <Text size="sm">Rewards: {selectedToken.userDetails?.rewards}</Text>
        <Text size="sm">
          Is Collateral:{" "}
          {selectedToken.userDetails?.isCollateral ? "yes" : "no"}
        </Text>
        <Text size="sm">
          Supply Balance In Underlying:{" "}
          {selectedToken.userDetails?.supplyBalanceInUnderlying}
        </Text>
        <Text size="sm">
          Allowance Underlying: {selectedToken.userDetails?.underlyingAllowance}
        </Text>
        <Input
          type="amount"
          balance={maxAmountForLendingTx(
            currentAction,
            selectedToken,
            clmPosition.position
          )}
          decimals={selectedToken.underlying.decimals}
          value={amount}
          onChange={(val) => {
            setAmount(val.target.value);
          }}
        />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <LendingActionSwitch action={CTokenLendingTxTypes.SUPPLY} />
          <LendingActionSwitch action={CTokenLendingTxTypes.WITHDRAW} />
          <LendingActionSwitch action={CTokenLendingTxTypes.BORROW} />
          <LendingActionSwitch action={CTokenLendingTxTypes.REPAY} />
        </div>
        <Button
          disabled={!transaction.canPerformTx(amount, currentAction)}
          onClick={() => transaction.performTx(amount, currentAction)}
        >
          CONFIRM
        </Button>
      </>
    );
  }

  function Content(token: CTokenWithUserData) {
    return (
      <div className={styles.content}>
        <Spacer height="20px" />
        <Image
          src={token.underlying.logoURI}
          width={50}
          height={50}
          alt={"Transaction"}
        />
        <Spacer height="10px" />

        <Text font="proto_mono" size="lg">
          {token.symbol}
        </Text>
        <Spacer height="20px" />

        <Container width="100%" gap={20}>
          <Container className={styles.card} padding="md" width="100%">
            <Card name="Dist APR" value={token.borrowApy + "%"} />
            <Card name="Supply APR" value={token.supplyApy + "%"} />
            <Card
              name="Collateral Factor"
              value={formatBalance(token.collateralFactor, 18)}
            />
          </Container>
          <Container className={styles.card} padding="md" width="100%">
            <Card
              name="Wallet Balance"
              value={formatBalance(
                token.userDetails?.balanceOfUnderlying ?? "0",
                token.underlying.decimals,
                {
                  commify: true,
                }
              )}
              note
            />

            <Card
              name="Supplied Amount"
              value={formatBalance(
                token.userDetails?.supplyBalanceInUnderlying ?? "0",
                token.underlying.decimals,
                {
                  commify: true,
                }
              )}
              note
            />

            <Card
              name="Account Liquidity Remaining"
              value={
                clmPosition.general.maxAccountLiquidity === "0"
                  ? "0"
                  : formatBalance(
                      clmPosition.general.maxAccountLiquidity,
                      token.underlying.decimals,
                      {
                        commify: true,
                      }
                    )
              }
              note
            />
          </Container>
        </Container>
        <Spacer height="70px" />
        <div
          style={{
            width: "100%",
          }}
        >
          <Input
            type="amount"
            balance="0"
            decimals={token.underlying.decimals}
            onChange={(val) => {
              setAmount(val.target.value);
            }}
            placeholder="0.0"
            value={amount}
          />
          <Spacer height="20px" />
          <Button
            width={"fill"}
            disabled={!transaction.canPerformTx(amount, currentAction)}
            onClick={() => transaction.performTx(amount, currentAction)}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      {selectedToken ? (
        <>
          <Tabs
            tabs={[
              {
                title: "Stake",
                content: Content(selectedToken),
              },
              {
                title: "withdraw",
                content: Content(selectedToken),
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
