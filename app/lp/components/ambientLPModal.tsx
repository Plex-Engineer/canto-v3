import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { ValidationReturn } from "@/config/interfaces";
import { AmbientPair } from "@/hooks/pairs/ambient/interfaces/ambientPairs";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";
import { convertFromQ64RootPrice } from "@/utils/ambient/ambientMath.utils";
import {
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
} from "@/utils/ambient/liquidity.utils";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { useState } from "react";

interface TestAmbientModalProps {
  pair: AmbientPair;
  validateParams: (
    params: Partial<AmbientTransactionParams>
  ) => ValidationReturn;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}
interface AddParams {
  minPrice: string;
  maxPrice: string;
  amount: string;
  isAmountBase: boolean;
  txType: AmbientTxType.ADD_CONC_LIQIDITY;
}

export const TestAmbientModal = (props: TestAmbientModalProps) => {
  const [modalType, setModalType] = useState<"add" | "remove" | "base">("base");
  return (
    <Container>
      {modalType !== "base" && (
        <Button onClick={() => setModalType("base")}>Back</Button>
      )}
      <Text size="lg" weight="bold">
        {props.pair.symbol}
      </Text>
      <Spacer height="20px" />
      {modalType === "base" && (
        <>
          <Button onClick={() => setModalType("add")}>
            ADD CONC LIQUIDITY
          </Button>
          <Button onClick={() => setModalType("remove")}>
            REMOVE CONC LIQUIDITY
          </Button>
        </>
      )}
      {modalType === "add" && (
        <TestAddAmbientLiquidity
          pair={props.pair}
          sendTxFlow={props.sendTxFlow}
          validateParams={props.validateParams}
        />
      )}
    </Container>
  );
};

interface TestAddProps {
  pair: AmbientPair;
  sendTxFlow: (params: AddParams) => void;
  validateParams: (params: AddParams) => ValidationReturn;
}
const TestAddAmbientLiquidity = ({
  pair,
  sendTxFlow,
  validateParams,
}: TestAddProps) => {
  // TODO:default price range
  const defaultMinPrice = convertFromQ64RootPrice("16602069666338596454400000");
  const defaultMaxPrice = convertFromQ64RootPrice("20291418481080506777600000");
  const currentPrice = convertFromQ64RootPrice(pair.q64PriceRoot);
  // values
  const [baseValue, setBaseValue] = useState("");
  const [quoteValue, setQuoteValue] = useState("");
  const [lastUpdated, setLastUpdated] = useState<"base" | "quote">("base");

  function setValue(value: string, isBase: boolean) {
    if (isBase) {
      setLastUpdated("base");
      setBaseValue(value);
      setQuoteValue(
        formatBalance(
          getConcQuoteTokensFromBaseTokens(
            convertToBigNumber(value, pair.base.decimals).data.toString(),
            currentPrice,
            defaultMinPrice,
            defaultMaxPrice
          ),
          pair.quote.decimals
        )
      );
    } else {
      setLastUpdated("quote");
      setQuoteValue(value);
      setBaseValue(
        formatBalance(
          getConcBaseTokensFromQuoteTokens(
            convertToBigNumber(value, pair.quote.decimals).data.toString(),
            currentPrice,
            defaultMinPrice,
            defaultMaxPrice
          ),
          pair.base.decimals
        )
      );
    }
  }

  // validation
  const paramCheck = validateParams({
    minPrice: defaultMinPrice,
    maxPrice: defaultMaxPrice,
    txType: AmbientTxType.ADD_CONC_LIQIDITY,
    amount:
      lastUpdated === "base"
        ? convertToBigNumber(baseValue, pair.base.decimals).data?.toString() ??
          "0"
        : convertToBigNumber(
            quoteValue,
            pair.quote.decimals
          ).data?.toString() ?? "0",
    isAmountBase: lastUpdated === "base",
  });

  return (
    <Container>
      <h3>
        price:{" "}
        {displayAmount(
          currentPrice,
          Math.abs(pair.base.decimals - pair.quote.decimals)
        )}
      </h3>
      <h3>
        min-price:{" "}
        {displayAmount(
          defaultMinPrice,
          Math.abs(pair.base.decimals - pair.quote.decimals)
        )}
      </h3>
      <h3>
        max-price:{" "}
        {displayAmount(
          defaultMaxPrice,
          Math.abs(pair.base.decimals - pair.quote.decimals)
        )}
      </h3>
      <Spacer height="40px" />
      <Input
        label={pair.base.symbol}
        value={baseValue}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        type="amount"
        balance={pair.base.balance ?? "0"}
        decimals={pair.base.decimals}
        error={
          !paramCheck.isValid &&
          Number(baseValue) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.base.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="40px" />
      <Input
        label={pair.quote.symbol}
        value={quoteValue}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        type="amount"
        balance={pair.quote.balance ?? "0"}
        decimals={pair.quote.decimals}
        error={
          !paramCheck.isValid &&
          Number(quoteValue) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.quote.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="40px" />
      <Button
        onClick={() =>
          sendTxFlow({
            minPrice: defaultMinPrice,
            maxPrice: defaultMaxPrice,
            txType: AmbientTxType.ADD_CONC_LIQIDITY,
            amount:
              lastUpdated === "base"
                ? convertToBigNumber(
                    baseValue,
                    pair.base.decimals
                  ).data?.toString() ?? "0"
                : convertToBigNumber(
                    quoteValue,
                    pair.quote.decimals
                  ).data?.toString() ?? "0",
            isAmountBase: lastUpdated === "base",
          })
        }
      >
        ADD CONC LIQUIDITY
      </Button>
    </Container>
  );
};
