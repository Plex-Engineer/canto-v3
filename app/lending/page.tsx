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
import { useState } from "react";
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
  const {
    cTokens,
    sortedTokens,
    position,
    loading,
    modalOpen,
    setModalOpen,
    selectedToken,
    setSelectedToken,
    currentAction,
    setCurrentAction,
    lendingTx,
    canPerformTx,
    txStore,
    cNote,
    amount,
    setAmount,
  } = useLendingCombo();

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

  const columns = [
    "token",
    "borrowApy",
    "distApy",
    "supplyApy",
    "price",
    "wallet balance",
    "borrow balance",
    "rewards",
    "isCollateral",
    "supply balance",
  ];
  const CTokenTable = ({ cTokens }: { cTokens: CTokenWithUserData[] }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <td key={column} style={{ display: "table-cell" }}>
              {column}
            </td>
          ))}
        </tr>
      </thead>
      {cTokens.map((cToken) => (
        <CTokenRow key={cToken.address} cToken={cToken} />
      ))}
    </table>
  );

  const CTokenRow = ({ cToken }: { cToken: CTokenWithUserData }) => (
    <tr
      style={{
        fontWeight: "400",
        lineHeight: "4rem",
        backgroundColor: "blue",
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedToken(cToken);
        setModalOpen(true);
      }}
    >
      <td>
        <Icon
          icon={{
            url: cToken.underlying.logoURI,
            size: 25,
          }}
        />
        {cToken.underlying.symbol}
      </td>
      <td>{cToken.borrowApy}</td>
      <td>{cToken.distApy}</td>
      <td>{cToken.supplyApy}</td>
      <td>{formatBalance(cToken.price, 36 - cToken.underlying.decimals)}</td>
      <td>
        {formatBalance(
          cToken.userDetails?.balanceOfUnderlying ?? "0",
          cToken.underlying.decimals
        )}
      </td>
      <td>
        {formatBalance(
          cToken.userDetails?.borrowBalance ?? "0",
          cToken.underlying.decimals
        )}
      </td>
      <td>{formatBalance(cToken.userDetails?.rewards ?? "0", 18)}</td>
      <td>{cToken.userDetails?.isCollateral ? "yes" : "no"}</td>
      <td>
        {formatBalance(
          cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
          cToken.underlying.decimals
        )}
      </td>
    </tr>
  );

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
                  position
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
                disabled={!canPerformTx(amount, currentAction)}
                onClick={() => lendingTx(amount, currentAction)}
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
          Total Borrow:{" "}
          {formatBalance(position.totalBorrow, 18, {
            commify: true,
            precision: 2,
          })}
        </Text>
        <Text size="lg" font="proto_mono">
          Total Supply:{" "}
          {formatBalance(position.totalSupply, 18, {
            commify: true,
            precision: 2,
          })}
        </Text>
        <Text size="lg" font="proto_mono">
          Total Liquidity: {formatBalance(position.liquidity, 18)}
        </Text>
        <Text size="lg" font="proto_mono">
          Total Shortfall: {formatBalance(position.shortfall, 18)}
        </Text>
        <Text size="lg" font="proto_mono">
          Total Rewards: {formatBalance(position.totalRewards, 18)}
        </Text>
        <Text size="lg" font="proto_mono">
          Average Apr: {position.avgApr}
        </Text>{" "}
      </section>

      {/* <Spacer height="30px" />
      <Text size="x-lg" font="proto_mono">
        CNOTE BY ITSELF
      </Text>
      <CTokenTable cTokens={cNote ? [cNote] : []} />
      <Spacer height="30px" />
      <CTokenTable cTokens={sortedTokens} /> */}
      {cNote && (
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
          data={[
            [
              <>
                <Icon icon={{ url: cNote.underlying.logoURI, size: 30 }} />
                <Spacer width="10px" />
                <Text theme="primary-dark" key={cNote.name}>
                  {cNote.underlying.name}
                </Text>
              </>,
              <Text theme="primary-dark" key={cNote.supplyApy}>
                {cNote.supplyApy}
              </Text>,
              <Text theme="primary-dark" key={cNote.supplyApy}>
                {formatBalance(
                  cNote.userDetails?.balanceOfUnderlying!,
                  cNote.decimals
                )}
              </Text>,
              <Text theme="primary-dark" key={cNote.supplyApy}>
                {cNote.userDetails?.supplyBalanceInUnderlying}
              </Text>,
              <Text theme="primary-dark" key={cNote.supplyApy}>
                {formatBalance(cNote.collateralFactor, 18)}
              </Text>,

              <Container key={"Test"} direction="row">
                <Button
                  key={cNote.address}
                  color="secondary"
                  onClick={() => {
                    setSelectedToken(cNote);
                    setModalOpen(true);
                  }}
                >
                  Supply
                </Button>
                <Spacer width="6px" />
                <Button
                  key={cNote.address}
                  color="secondary"
                  onClick={() => {
                    setSelectedToken(cNote);
                    setModalOpen(true);
                  }}
                >
                  Withdraw
                </Button>
              </Container>,
            ],
          ]}
        />
      )}
    </div>
  );
}
