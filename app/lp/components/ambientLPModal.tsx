"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { useState } from "react";
import Container from "@/components/container/container";
import { ValidationReturn } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import styles from "./cantoDex.module.scss";
import Amount from "@/components/amount/amount";
import Tabs from "@/components/tabs/tabs";
import { ModalItem } from "@/app/lending/components/modal/modal";
import { AmbientPair } from "@/hooks/pairs/ambient/interfaces/ambientPairs";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "@/hooks/pairs/ambient/interfaces/ambientTxTypes";
import {
  convertFromQ64RootPrice,
  getPriceFromTick,
} from "@/utils/ambient/ambientMath.utils";
import { DEFAULT_AMBIENT_TICKS } from "@/hooks/pairs/ambient/config/prices";
import {
  baseTokenFromConcLiquidity,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  quoteTokenFromConcLiquidity,
} from "@/utils/ambient/liquidity.utils";
import { percentOfAmount } from "@/utils/tokens/tokenMath.utils";
import Slider from "@/components/slider/slider";

interface AmbientModalProps {
  pair: AmbientPair;
  validateParams: (
    params: Partial<AmbientTransactionParams>
  ) => ValidationReturn;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}

export const AmbientModal = (props: AmbientModalProps) => {
  return (
    <Container className={styles.container} width="32rem">
      <div
        style={{
          height: "100%",
        }}
      >
        <Container
          direction="row"
          height="50px"
          center={{
            vertical: true,
          }}
          style={{
            cursor: "pointer",
            marginTop: "-14px",
          }}
        >
          <Text font="proto_mono" size="lg">
            Liquidity
          </Text>
        </Container>
        <div
          style={{
            margin: "0  -16px -16px -16px",
            height: "39rem",
          }}
        >
          <Tabs
            tabs={[
              {
                title: "Add",
                content: (
                  <Container width="100%" margin="sm">
                    <div className={styles.iconTitle}>
                      <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
                      <Text size="lg" font="proto_mono">
                        {props.pair.symbol}
                      </Text>
                    </div>
                    <AddAmbientLiquidity
                      pair={props.pair}
                      sendTxFlow={props.sendTxFlow}
                      validateParams={props.validateParams}
                    />
                  </Container>
                ),
              },
              {
                title: "Remove",
                isDisabled:
                  props.pair.userDetails?.defaultRangePosition.liquidity ===
                  "0",
                content: (
                  <Container width="100%" margin="sm">
                    <div className={styles.iconTitle}>
                      <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
                      <Text size="lg" font="proto_mono">
                        {props.pair.symbol}
                      </Text>
                    </div>
                    <RemoveAmbientLiquidity
                      pair={props.pair}
                      sendTxFlow={props.sendTxFlow}
                      validateParams={props.validateParams}
                    />
                  </Container>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

interface AddConcParams {
  lowerTick: number;
  upperTick: number;
  amount: string;
  isAmountBase: boolean;
  txType: AmbientTxType.ADD_CONC_LIQUIDITY;
}
interface AddModalProps {
  pair: AmbientPair;
  sendTxFlow: (params: AddConcParams) => void;
  validateParams: (params: AddConcParams) => ValidationReturn;
}
const AddAmbientLiquidity = ({
  pair,
  validateParams,
  sendTxFlow,
}: AddModalProps) => {
  // values
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
      <Spacer height="10px" />
      <Amount
        decimals={pair.base.decimals}
        value={baseValue}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        IconUrl={pair.base.logoURI}
        title={pair.base.symbol}
        max={pair.base.balance ?? "0"}
        symbol={pair.base.symbol}
        error={
          !paramCheck.isValid &&
          Number(baseValue) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.base.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />

      <Spacer height="20px" />

      <Amount
        decimals={pair.quote.decimals}
        value={quoteValue}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        IconUrl={pair.quote.logoURI}
        title={pair.quote.symbol}
        max={pair.quote.balance ?? "0"}
        symbol={pair.quote.symbol}
        error={
          !paramCheck.isValid &&
          Number(quoteValue) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.quote.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="20px" />
      <Container className={styles.card}>
        <ModalItem
          name="Price"
          value={displayAmount(
            currentPrice,
            Math.abs(pair.base.decimals - pair.quote.decimals)
          )}
        />

        <ModalItem
          name="Min Price"
          value={displayAmount(
            defaultMinPrice,
            Math.abs(pair.base.decimals - pair.quote.decimals)
          )}
        />

        <ModalItem
          name="Max Price"
          value={displayAmount(
            defaultMaxPrice,
            Math.abs(pair.base.decimals - pair.quote.decimals)
          )}
        />
      </Container>
      <Spacer height="30px" />
      <Button
        disabled={!paramCheck.isValid}
        width={"fill"}
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
        {"Add Liquidity"}
      </Button>
      <Spacer height="20px" />
    </Container>
  );
};

interface RemoveConcParams {
  lowerTick: number;
  upperTick: number;
  liquidity: string;
  txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
}
interface RemoveProps {
  pair: AmbientPair;
  sendTxFlow: (params: RemoveConcParams) => void;
  validateParams: (params: RemoveConcParams) => ValidationReturn;
}

const RemoveAmbientLiquidity = ({
  pair,
  validateParams,
  sendTxFlow,
}: RemoveProps) => {
  const [percentToRemove, setPercentToRemove] = useState(0);
  const liquidityToRemove = percentOfAmount(
    pair.userDetails?.defaultRangePosition?.liquidity ?? "0",
    percentToRemove
  );

  return (
    <div>
      <Spacer height="10px" />
      <Container direction="row">
        <Slider
          value={percentToRemove}
          onChange={(val) => setPercentToRemove(val)}
          min={1}
          max={100}
          step={1}
          label="percent to remove"
        />
        <Input
          value={percentToRemove.toString()}
          onChange={(e) => setPercentToRemove(Number(e.target.value))}
          type="number"
          min={0}
          max={100}
        />
      </Container>
      <Spacer height="20px" />

      <Text
        font="proto_mono"
        size="xx-sm"
        style={{
          marginLeft: "16px",
        }}
      >
        Expected Tokens
      </Text>
      <Spacer height="6px" />

      <Container className={styles.card}>
        <ModalItem
          name={pair.base.symbol}
          value={displayAmount(
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
        />
        <ModalItem
          name={pair.quote.symbol}
          value={displayAmount(
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
        />
      </Container>
      <Spacer height="30px" />

      <Button
        disabled={Number(percentToRemove) <= 0 || Number(percentToRemove) > 100}
        width={"fill"}
        onClick={() =>
          sendTxFlow({
            lowerTick: DEFAULT_AMBIENT_TICKS.minTick,
            upperTick: DEFAULT_AMBIENT_TICKS.maxTick,
            txType: AmbientTxType.REMOVE_CONC_LIQUIDITY,
            liquidity: liquidityToRemove.data.toString(),
          })
        }
      >
        Remove Liquidity
      </Button>
    </div>
  );
};
