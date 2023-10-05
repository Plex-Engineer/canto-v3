import Button from "@/components/button/button";
import { useWalletClient } from "wagmi";
import useAmbientPairs from "@/hooks/pairs/ambient/useAmbientPairs";
import { convertFromQ64RootPrice } from "@/utils/ambient/ambientMath.utils";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { useEffect, useState } from "react";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";
import useStore from "@/stores/useStore";
import useTransactionStore from "@/stores/transactionStore";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { AmbientTxType } from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";

export function TestAmbient() {
  const txStore = useStore(useTransactionStore, (state) => state);
  const { ambientPairs } = useAmbientPairs({ chainId: 7701 });
  const { data: signer } = useWalletClient();
  // const ambient = useTestAmbient();

  // console.log(ambient);

  async function addLiquidity() {
    if (!selectedPair || !signer) return;
    txStore?.addNewFlow({
      txFlow: {
        txType: TransactionFlowType.AMBIENT_LIQUIDITY_TX,
        title: "Add Ambient Liquidity",
        icon: "",
        params: {
          chainId: 7701,
          ethAccount: signer.account.address,
          pair: selectedPair,
          minPrice: convertFromQ64RootPrice("16602069666338596454400000"),
          maxPrice: convertFromQ64RootPrice("20291418481080506777600000"),
          txType: AmbientTxType.ADD_CONC_LIQIDITY,
          amount: convertToBigNumber(
            userInput,
            isBaseAmount
              ? selectedPair.base.decimals
              : selectedPair.quote.decimals
          ).data.toString(),
          isAmountBase: isBaseAmount,
        },
      },
      signer,
    });
    return;
  }

  const [selectedPair, setSelectedPair] = useState(ambientPairs?.[0] || null);
  const [isBaseAmount, setIsBaseAmount] = useState(true);
  const [calculatedAmount, setCalculatedAmount] = useState("0");
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    setSelectedPair(ambientPairs?.[0]);
  }, [ambientPairs?.length]);

  useEffect(() => {
    if (!selectedPair) return;
    if (isBaseAmount) {
      setCalculatedAmount(
        formatBalance(
          getConcQuoteTokensFromBaseTokens(
            convertToBigNumber(
              userInput,
              selectedPair.base.decimals
            ).data.toString(),
            convertFromQ64RootPrice("18446651618847488224343388"),
            convertFromQ64RootPrice("16602069666338596454400000"),
            convertFromQ64RootPrice("20291418481080506777600000")
          ),
          selectedPair.quote.decimals
        )
      );
    } else {
      setCalculatedAmount(
        formatBalance(
          getConcBaseTokensFromQuoteTokens(
            convertToBigNumber(
              userInput,
              selectedPair.quote.decimals
            ).data.toString(),
            convertFromQ64RootPrice("18446651618847488224343388"),
            convertFromQ64RootPrice("16602069666338596454400000"),
            convertFromQ64RootPrice("20291418481080506777600000")
          ),
          selectedPair.base.decimals
        )
      );
    }
  }, [userInput, isBaseAmount]);
  return (
    <div>
      <h1>Test Ambient</h1>
      {ambientPairs?.map((pair) => (
        <ul key={pair.base.address + pair.quote.address}>
          <li>base: {pair.base.symbol}</li>
          <li>quote: {pair.quote.symbol}</li>
          <li>
            price:{" "}
            {displayAmount(
              convertFromQ64RootPrice(pair.q64PriceRoot),
              Math.abs(pair.base.decimals - pair.quote.decimals)
            )}
          </li>
          <li>current tick: {pair.currentTick}</li>
          <li>
            active liquidity:
            <ul style={{ paddingLeft: "1rem" }}>
              <li>base: {pair.liquidity.base}</li>
              <li>quote: {pair.liquidity.quote}</li>
            </ul>
          </li>
          <li>concentrated liquidity: {pair.concLiquidity}</li>
        </ul>
      ))}
      <Button onClick={() => addLiquidity().then(console.log)}>
        Add Ambient Liquidity
      </Button>
      <Button onClick={() => setIsBaseAmount(!isBaseAmount)}>
        {isBaseAmount ? "BASE" : "QUOTE"}
      </Button>
      <input value={userInput} onChange={(e) => setUserInput(e.target.value)} />
      {`${isBaseAmount ? "QUOTE" : "BASE"} AMOUNT: ${calculatedAmount}`}
    </div>
  );
}
