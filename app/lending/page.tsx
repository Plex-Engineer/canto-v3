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
              <h2>{selectedToken.symbol}</h2>
              <h3>name: {selectedToken.name}</h3>
              <h3>Address: {selectedToken.address}</h3>
              <h3>BorrowApy: {selectedToken.borrowApy}</h3>
              <h3>BorrowCap: {selectedToken.borrowCap}</h3>
              <h3>Cash: {selectedToken.cash}</h3>
              <h3>CollateralFactor: {selectedToken.collateralFactor}</h3>
              <h3>Decimals: {selectedToken.decimals}</h3>
              <h3>DistApy: {selectedToken.distApy}</h3>
              <h3>Exchange Rate: {selectedToken.exchangeRate}</h3>
              <h3>IsListed: {selectedToken.isListed ? "yes" : "no"}</h3>
              <h3>Liquidity: {selectedToken.liquidity}</h3>
              <h3>Underlying Price: {selectedToken.price}</h3>
              <h3>Supply Apy: {selectedToken.supplyApy}</h3>
              <h1>----</h1>
              <h2>Underlying:</h2>
              <h3>Address: {selectedToken.underlying.address}</h3>
              <h3>Decimals: {selectedToken.underlying.decimals}</h3>
              <h3>Symbol: {selectedToken.underlying.symbol}</h3>
              <h3>Name: {selectedToken.underlying.name}</h3>
              <h1>----</h1>
              <h2>User Data:</h2>
              <h2>
                CToken Balance: {selectedToken.userDetails?.balanceOfCToken}
              </h2>
              <h2>
                Underlying Balance:{" "}
                {selectedToken.userDetails?.balanceOfUnderlying}
              </h2>
              <h2>
                Borrow Balance: {selectedToken.userDetails?.borrowBalance}
              </h2>
              <h2>Rewards: {selectedToken.userDetails?.rewards}</h2>
              <h2>
                Is Collateral:{" "}
                {selectedToken.userDetails?.isCollateral ? "yes" : "no"}
              </h2>
              <h2>
                Supply Balance In Underlying:{" "}
                {selectedToken.userDetails?.supplyBalanceInUnderlying}
              </h2>
              <h2>
                Allowance Underlying:{" "}
                {selectedToken.userDetails?.underlyingAllowance}
              </h2>
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
                {cNote.userDetails?.balanceOfUnderlying}
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
                  color="primary"
                  onClick={() => {
                    setSelectedToken(cNote);
                    setModalOpen(true);
                  }}
                >
                  Supply
                </Button>
                ,
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
