"use client";

import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
import { formatBalance } from "@/utils/tokenBalances.utils";
import { useLendingCombo } from "./utils";
import Text from "@/components/text";
import Container from "@/components/container/container";

interface LendingProps {
  Asset: string;
  APR: string;
  WalletBalance: string;
  SuppliedAmount: string;
  CollateralFactor: string;
  Actions: {
    name: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

export default function LendingPage() {
  const { cTokens, clmPosition, transaction, selection } = useLendingCombo();
  const { cNote, rwas } = cTokens;
  const {
    currentAction,
    setCurrentAction,
    modalOpen,
    setModalOpen,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
  } = selection;
  interface LSProps {
    action: CTokenLendingTxTypes;
  }
  const LendingActionSwitch = ({ action }: LSProps) => (
    <Button
      color={action === currentAction ? "accent" : "primary"}
      onClick={() => setCurrentAction(action)}
    >
      {action}
    </Button>
  );

  const CTokenRow = ({ cToken }: { cToken: CTokenWithUserData }) => [
    <>
      <Icon icon={{ url: cToken.underlying.logoURI, size: 30 }} />
      <Spacer width="10px" />
      <Text theme="primary-dark" key={cToken.name + cToken.name}>
        {cToken.underlying.name}
      </Text>
    </>,
    <Text theme="primary-dark" key={cToken.name + "cToken.supplyApy"}>
      {cToken.supplyApy + "%"}
    </Text>,
    <Text theme="primary-dark" key={cToken.name + "cToken.balance"}>
      {formatBalance(
        cToken.userDetails?.balanceOfUnderlying ?? "0",
        cToken.underlying.decimals,
        {
          commify: true,
        }
      )}
    </Text>,
    <Text theme="primary-dark" key={cToken.name + "cToken.ubalance"}>
      {formatBalance(
        cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
        cToken.underlying.decimals,
        {
          commify: true,
        }
      )}
    </Text>,
    <Text theme="primary-dark" key={cToken.name + "cToken.CF"}>
      {formatBalance(cToken.collateralFactor, 16) + "%"}
    </Text>,
    <Container key={cToken.name + "Test"} direction="row">
      <Button
        key={cToken.name + "cToken.supply"}
        color="primary"
        onClick={() => {
          setSelectedToken(cToken);
          setModalOpen(true);
        }}
      >
        Supply
      </Button>
      ,
      <Button
        key={cToken.name + "cToken.siwthdraw"}
        color="secondary"
        onClick={() => {
          setSelectedToken(cToken);
          setModalOpen(true);
        }}
      >
        Withdraw
      </Button>
    </Container>,
  ];

  return (
    <div>
      <Text size="x-lg" font="proto_mono">
        Lending
      </Text>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
              <Text size="sm">
                Decimals: {selectedToken.underlying.decimals}
              </Text>
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
                Underlying Balance:{" "}
                {selectedToken.userDetails?.balanceOfUnderlying}
              </Text>
              <Text size="sm">
                Borrow Balance: {selectedToken.userDetails?.borrowBalance}
              </Text>
              <Text size="sm">
                Rewards: {selectedToken.userDetails?.rewards}
              </Text>
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
      </Modal>
      <section>
        {" "}
        <Text size="lg" font="proto_mono">
          USER POSITION
        </Text>
        <Text size="lg" font="proto_mono">
          Maximum Account Liquidity: {}
          {formatBalance(clmPosition.general.maxAccountLiquidity, 18, {
            commify: true,
            precision: 2,
          })}
        </Text>
        <Text size="lg" font="proto_mono">
          Outstanding Debt:{" "}
          {formatBalance(clmPosition.general.outstandingDebt, 18, {
            commify: true,
            precision: 2,
          })}
        </Text>
        <Text size="lg" font="proto_mono">
          Percent Limit Used: {clmPosition.general.percentLimitUsed + "%"}
        </Text>
        <Text size="lg" font="proto_mono">
          Average Apr: {clmPosition.general.netApr + "%"}
        </Text>{" "}
      </section>
      {cNote && (
        <Table
          columns={7}
          title="CNOTE"
          headers={[
            "Asset",
            "APR",
            "Wallet Balance",
            "Supplied Amount",
            "Collateral Factor",
            "",
          ]}
          data={[CTokenRow({ cToken: cNote })]}
        />
      )}
      {rwas.length > 0 && (
        <Table
          columns={7}
          title="RWAS"
          headers={[
            "Asset",
            "APR",
            "Wallet Balance",
            "Supplied Amount",
            "Collateral Factor",
            "",
          ]}
          data={[...rwas.map((cToken) => CTokenRow({ cToken }))]}
        />
      )}
    </div>
  );
}
