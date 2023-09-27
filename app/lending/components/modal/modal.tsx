import Button from "@/components/button/button";
import Text from "@/components/text";
import Input from "@/components/input/input";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";

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

  return (
    <>
      {selectedToken && (
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
          <Text size="sm">
            IsListed: {selectedToken.isListed ? "yes" : "no"}
          </Text>
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
            Allowance Underlying:{" "}
            {selectedToken.userDetails?.underlyingAllowance}
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
      )}
    </>
  );
};
