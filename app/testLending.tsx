import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Modal from "@/components/modal/modal";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import useLending from "@/hooks/lending/useLending";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useEffect, useMemo, useState } from "react";
import { useWalletClient } from "wagmi";

export default function TestLending() {
  const { data: signer } = useWalletClient();

  const [amount, setAmount] = useState("");
  const { tokens, position, loading, error, canPerformLendingTx } = useLending({
    testnet: false,
    userEthAddress: signer?.account.address,
  });
  const sortedTokens = useMemo(() => {
    return tokens.sort((a, b) =>
      a.underlying.symbol.localeCompare(b.underlying.symbol)
    );
  }, [tokens]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

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
                value={amount}
                onChange={(val) => {
                  setAmount(val.target.value);
                }}
              />
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Button
                  color="accent"
                  disabled={
                    !canPerformLendingTx({
                      chainId: 7700,
                      ethAccount: signer?.account.address ?? "",
                      cToken: selectedToken,
                      amount: convertToBigNumber(
                        amount,
                        selectedToken.underlying.decimals
                      ).data.toString(),
                      type: CTokenLendingTxTypes.SUPPLY,
                    }).data
                  }
                >
                  SUPPLY
                </Button>
                <Button
                  color="accent"
                  disabled={
                    !canPerformLendingTx({
                      chainId: 7700,
                      ethAccount: signer?.account.address ?? "",
                      cToken: selectedToken,
                      amount: convertToBigNumber(
                        amount,
                        selectedToken.underlying.decimals
                      ).data.toString(),
                      type: CTokenLendingTxTypes.WITHDRAW,
                    }).data
                  }
                >
                  WITHDRAW
                </Button>
                <Button
                  color="accent"
                  disabled={
                    !canPerformLendingTx({
                      chainId: 7700,
                      ethAccount: signer?.account.address ?? "",
                      cToken: selectedToken,
                      amount: convertToBigNumber(
                        amount,
                        selectedToken.underlying.decimals
                      ).data.toString(),
                      type: CTokenLendingTxTypes.BORROW,
                    }).data
                  }
                >
                  BORROW
                </Button>
                <Button
                  color="accent"
                  disabled={
                    !canPerformLendingTx({
                      chainId: 7700,
                      ethAccount: signer?.account.address ?? "",
                      cToken: selectedToken,
                      amount: convertToBigNumber(
                        amount,
                        selectedToken.underlying.decimals
                      ).data.toString(),
                      type: CTokenLendingTxTypes.REPAY,
                    }).data
                  }
                >
                  REPAY
                </Button>
              </div>
            </>
          )}
        </>
      </Modal>
      <h1>USER POSITION</h1>
      {position && (
        <>
          <h2>Total Borrow: {position.totalBorrow}</h2>
          <h2>
            Total Supply:{" "}
            {formatBalance(position.totalSupply, 18, {
              commify: true,
              precision: 2,
            })}
          </h2>
          <h2>Total Liquidity: {position.liquidity}</h2>
          <h2>Total Shortfall: {position.shortfall}</h2>
          <h2>Total Rewards: {position.totalRewards}</h2>
        </>
      )}
      <h1>CTOKENS: </h1>
      {sortedTokens.map((cToken) => (
        <div key={cToken.address}>
          <h1>-------------------</h1>
          <h2>
            {cToken.underlying.symbol}{" "}
            <Button
              color="accent"
              onClick={() => {
                setSelectedToken(cToken);
                setModalOpen(true);
              }}
            >
              SELECT TOKEN
            </Button>
          </h2>
          <h1>-------------------</h1>
        </div>
      ))}
    </div>
  );
}
