import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Modal from "@/components/modal/modal";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import useLending from "@/hooks/lending/useLending";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useMemo, useState } from "react";
import { useWalletClient } from "wagmi";

export default function TestLending() {
  const { data: signer } = useWalletClient();
  const txStore = useStore(useTransactionStore, (state) => state);

  const [amount, setAmount] = useState("");
  const { tokens, position, loading, transaction } = useLending({
    chainId: signer?.chain.id === 7701 ? 7701 : 7700,
    userEthAddress: signer?.account.address,
  });
  const sortedTokens = useMemo(() => {
    return tokens.sort((a, b) =>
      a.underlying.symbol.localeCompare(b.underlying.symbol)
    );
  }, [tokens]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const [currentAction, setCurrentAction] = useState<CTokenLendingTxTypes>(
    CTokenLendingTxTypes.SUPPLY
  );

  function lendingTx(amount: string, txType: CTokenLendingTxTypes) {
    const { data, error } = transaction.createNewLendingFlow({
      chainId: signer?.chain.id ?? 0,
      ethAccount: signer?.account.address ?? "",
      cToken: selectedToken,
      amount: convertToBigNumber(
        amount,
        selectedToken.underlying.decimals
      ).data.toString(),
      txType,
    });
    if (error) {
      console.log(error);
      return;
    }
    txStore?.addNewFlow({ txFlow: data, signer });
  }

  const canPerformTx = (amount: string, txType: CTokenLendingTxTypes) =>
    !isNaN(Number(amount)) &&
    transaction.canPerformLendingTx({
      chainId: signer?.chain.id ?? 7700,
      ethAccount: signer?.account.address ?? "",
      cToken: selectedToken,
      amount: convertToBigNumber(
        amount,
        selectedToken.underlying.decimals
      ).data?.toString(),
      txType,
    }).data;

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
    "symbol",
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
      <td>{cToken.underlying.symbol}</td>
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
      <h1>Test Lending</h1>
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
      <h1>USER POSITION</h1>
      <h2>
        Total Borrow:{" "}
        {formatBalance(position.totalBorrow, 18, {
          commify: true,
          precision: 2,
        })}
      </h2>
      <h2>
        Total Supply:{" "}
        {formatBalance(position.totalSupply, 18, {
          commify: true,
          precision: 2,
        })}
      </h2>
      <h2>Total Liquidity: {formatBalance(position.liquidity, 18)}</h2>
      <h2>Total Shortfall: {formatBalance(position.shortfall, 18)}</h2>
      <h2>Total Rewards: {formatBalance(position.totalRewards, 18)}</h2>
      <h2>Average Apr: {position.avgApr}</h2>

      <CTokenTable cTokens={sortedTokens} />
    </div>
  );
}
