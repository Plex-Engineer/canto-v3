import Button from "@/components/button/button";
import Modal from "@/components/modal/modal";
import useLending from "@/hooks/lending/useLending";
import { useMemo, useState } from "react";

export default function TestLending() {
  const { tokens, position, loading, error } = useLending({
    testnet: false,
    userEthAddress: "0x8915da99B69e84DE6C97928d378D9887482C671c",
  });
  const sortedTokens = useMemo(() => {
    return tokens.sort((a, b) => a.underlying.symbol.localeCompare(b.underlying.symbol));
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
              <h3>Comp Supply State: {selectedToken.compSupplyState}</h3>
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
              <h2>
                Comp Supplier Index:{" "}
                {selectedToken.userDetails?.compSupplierIndex}
              </h2>
              <h2>
                Is Collateral:{" "}
                {selectedToken.userDetails?.isCollateral ? "yes" : "no"}
              </h2>
              <h2>
                Supply Balance In Underlying:{" "}
                {selectedToken.userDetails?.suppyBalanceInUnderlying}
              </h2>
              <h2>
                Allowance Underlying:{" "}
                {selectedToken.userDetails?.underlyingAllowance}
              </h2>
            </>
          )}
        </>
      </Modal>
      <h1>USER POSITION</h1>
      {position && (
        <>
          <h2>Total Borrow: {position.totalBorrow}</h2>
          <h2>Total Supply: {position.totalSupply}</h2>
          <h2>Total Liquidity: {position.liquidity}</h2>
          <h2>Total Shortfall: {position.shortfall}</h2>
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
