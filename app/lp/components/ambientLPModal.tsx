import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { ValidationReturn } from "@/config/interfaces";
import { DEFAULT_AMBIENT_TICKS } from "@/hooks/pairs/ambient/config/prices";
import { AmbientPair } from "@/hooks/pairs/ambient/interfaces/ambientPairs";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";
import {
  convertFromQ64RootPrice,
  getPriceFromTick,
} from "@/utils/ambient/ambientMath.utils";
import {
  baseTokenFromConcLiquidity,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  quoteTokenFromConcLiquidity,
} from "@/utils/ambient/liquidity.utils";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { percentOfAmount } from "@/utils/tokens/tokenMath.utils";
import { useState } from "react";
import styles from "./ambientLP.module.css";

interface TestAmbientModalProps {
  pair: AmbientPair;
  validateParams: (
    params: Partial<AmbientTransactionParams>
  ) => ValidationReturn;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}
interface AddParams {
  lowerTick: number;
  upperTick: number;
  amount: string;
  isAmountBase: boolean;
  txType: AmbientTxType.ADD_CONC_LIQUIDITY;
}
interface RemoveParams {
  lowerTick: number;
  upperTick: number;
  liquidity: string;
  txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
}

export const TestAmbientModal = (props: TestAmbientModalProps) => {
  const [modalType, setModalType] = useState<"add" | "remove" | "base">("base");
  return (
    <Container backgroundColor="blue">
      {modalType !== "base" && (
        <Button onClick={() => setModalType("base")}>Back</Button>
      )}
      <Text size="lg" weight="bold">
        {props.pair.symbol}
      </Text>
      <Spacer height="20px" />
      {modalType === "base" && (
        <>
          <Button onClick={() => setModalType("add")}>Add</Button>
          <Button onClick={() => setModalType("remove")}>Remove</Button>
        </>
      )}
      {modalType === "add" && (
        <TestAddAmbientLiquidity
          pair={props.pair}
          sendTxFlow={props.sendTxFlow}
          validateParams={props.validateParams}
        />
      )}
      {modalType === "remove" && (
        <TestRemoveAmbientLiquidity
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
  const defaultMinPrice = getPriceFromTick(DEFAULT_AMBIENT_TICKS.minTick);
  const defaultMaxPrice = getPriceFromTick(DEFAULT_AMBIENT_TICKS.maxTick);
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
    lowerTick: DEFAULT_AMBIENT_TICKS.minTick,
    upperTick: DEFAULT_AMBIENT_TICKS.maxTick,
    txType: AmbientTxType.ADD_CONC_LIQUIDITY,
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
            lowerTick: DEFAULT_AMBIENT_TICKS.minTick,
            upperTick: DEFAULT_AMBIENT_TICKS.maxTick,
            txType: AmbientTxType.ADD_CONC_LIQUIDITY,
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

interface TestRemoveProps {
  pair: AmbientPair;
  sendTxFlow: (params: RemoveParams) => void;
  validateParams: (params: RemoveParams) => ValidationReturn;
}
const TestRemoveAmbientLiquidity = ({
  pair,
  sendTxFlow,
  validateParams,
}: TestRemoveProps) => {
  const [percentToRemove, setPercentToRemove] = useState(0);
  const liquidityToRemove = percentOfAmount(
    pair.userDetails?.defaultRangePosition?.liquidity ?? "0",
    percentToRemove
  );

  return (
    <Container>
      <Spacer height="40px" />
      <Input
        value={percentToRemove.toString()}
        onChange={(e) => setPercentToRemove(Number(e.target.value))}
        type="number"
        min={0}
        max={100}
        label="percent to remove"
      />
      <Spacer height="40px" />
      <Text size="lg" weight="bold">
        expected base tokens:{" "}
        {displayAmount(
          baseTokenFromConcLiquidity(
            pair.q64PriceRoot,
            liquidityToRemove.data.toString(),
            pair.userDetails?.defaultRangePosition.lowerTick ?? 0,
            pair.userDetails?.defaultRangePosition.upperTick ?? 0
          ),
          pair.base.decimals,
          {
            symbol: pair.base.symbol,
          }
        )}
      </Text>
      <Spacer height="40px" />
      <Text size="lg" weight="bold">
        expected quote tokens:{" "}
        {displayAmount(
          quoteTokenFromConcLiquidity(
            pair.q64PriceRoot,
            liquidityToRemove.data.toString(),
            pair.userDetails?.defaultRangePosition.lowerTick ?? 0,
            pair.userDetails?.defaultRangePosition.upperTick ?? 0
          ),
          pair.quote.decimals,
          {
            symbol: pair.quote.symbol,
          }
        )}
      </Text>
      <Spacer height="40px" />
      <Button
        onClick={() =>
          sendTxFlow({
            lowerTick: DEFAULT_AMBIENT_TICKS.minTick,
            upperTick: DEFAULT_AMBIENT_TICKS.maxTick,
            txType: AmbientTxType.REMOVE_CONC_LIQUIDITY,
            liquidity: liquidityToRemove.data.toString(),
          })
        }
      >
        REMOVE CONC LIQUIDITY
      </Button>
    </Container>
  );
};
