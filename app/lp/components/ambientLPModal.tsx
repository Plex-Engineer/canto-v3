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
import { percentOfAmount } from "@/utils/tokens/tokenMath.utils";
import Slider from "@/components/slider/slider";
import clsx from "clsx";
import PopUp from "@/components/popup/popup";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { getDefaultTickRangeFromChainId } from "@/hooks/pairs/newAmbient/config/defaultTicks";
import {
  getPriceFromTick,
  getTickFromPrice,
} from "@/utils/ambient/ambientMath.utils";
import {
  baseTokenFromConcLiquidity,
  concLiquidityNoteValue,
  getConcBaseTokensFromQuoteTokens,
  getConcQuoteTokensFromBaseTokens,
  quoteTokenFromConcLiquidity,
} from "@/utils/ambient/liquidity.utils";
import { formatPercent } from "@/utils/formatting.utils";
import BigNumber from "bignumber.js";

interface AmbientModalProps {
  pair: AmbientPool;
  validateParams: (
    params: Partial<AmbientTransactionParams>
  ) => ValidationReturn;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}

export const AmbientModal = (props: AmbientModalProps) => {
  return (
    <Container className={styles.container} width="32rem">
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
      <div className={styles.inner}>
        {props.pair.userPositions.length === 0 ? (
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
                isDisabled: props.pair.userPositions.length === 0,
                content: (
                  <Container width="100%" margin="sm">
                    <div className={styles.iconTitle}>
                      <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
                      <Text size="lg" font="proto_mono">
                        {props.pair.symbol}
                      </Text>
                    </div>
                    <RemoveAmbientLiquidity
                      pool={props.pair}
                      sendTxFlow={props.sendTxFlow}
                      validateParams={props.validateParams}
                    />
                  </Container>
                ),
              },
            ]}
          />
        ) : (
          <>
            <div className={styles.iconTitle}>
              <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
              <Text size="lg" font="proto_mono">
                {props.pair.symbol}
              </Text>
            </div>
            <div className={styles["scroll-view"]}>
              <Container margin="md" gap={20} className={styles["items-list"]}>
                {props.pair.userPositions.map((item, idx) => (
                  <Container
                    key={idx}
                    width="100%"
                    gap={10}
                    center={{
                      horizontal: true,
                    }}
                    className={styles.item}
                    onClick={() => {}}
                  >
                    <Container direction="row" gap={20} width="100%">
                      <Text>Position</Text>
                      <Text size="md" font="proto_mono">
                        {idx + 1}
                      </Text>
                    </Container>

                    <Container direction="row" gap={"auto"} width="100%">
                      <Text size="md" font="proto_mono">
                        Range: (
                        {displayAmount(
                          getPriceFromTick(item.bidTick),
                          props.pair.base.decimals - props.pair.quote.decimals,
                          {
                            precision: 3,
                          }
                        )}{" "}
                        -{" "}
                        {displayAmount(
                          getPriceFromTick(item.askTick),
                          props.pair.base.decimals - props.pair.quote.decimals,
                          {
                            precision: 3,
                          }
                        )}
                        ){" "}
                        <span
                          style={{
                            position: "absolute",
                            transform: "translate(10%,-20%)",
                          }}
                        >
                          <Icon icon={{ url: props.pair.logoURI, size: 42 }} />
                        </span>
                      </Text>
                      <Text size="md" font="proto_mono">
                        {displayAmount(
                          concLiquidityNoteValue(
                            item.concLiq,
                            props.pair.stats.lastPriceSwap.toString(),
                            item.bidTick,
                            item.askTick,
                            new BigNumber(10)
                              .pow(36 - props.pair.base.decimals)
                              .toString(),
                            new BigNumber(10)
                              .pow(36 - props.pair.quote.decimals)
                              .toString()
                          ),
                          18
                        )}{" "}
                        <Icon icon={{ url: "tokens/note.svg", size: 16 }} />
                      </Text>
                    </Container>
                  </Container>
                ))}
              </Container>
            </div>
            <Spacer height="100%" />
            <div
              style={{
                margin: "1rem",
              }}
            >
              <Button width={"fill"}>New Position</Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

interface AddConcParams {
  lowerTick: number;
  upperTick: number;
  minPriceWei: string;
  maxPriceWei: string;
  amount: string;
  isAmountBase: boolean;
  txType: AmbientTxType;
}
interface AddModalProps {
  pair: AmbientPool;
  sendTxFlow: (params: AddConcParams) => void;
  validateParams: (params: AddConcParams) => ValidationReturn;
}
const AddAmbientLiquidity = ({
  pair,
  validateParams,
  sendTxFlow,
}: AddModalProps) => {
  // default ticks
  const currentTick = getTickFromPrice(pair.stats.lastPriceSwap.toString());
  const [selectedLowerTick, setSelectedLowerTick] = useState(currentTick - 75);
  const [selectedUpperTick, setSelectedUpperTick] = useState(currentTick + 75);
  // values
  const defaultMinPrice = getPriceFromTick(selectedLowerTick);
  const defaultMaxPrice = getPriceFromTick(selectedUpperTick);
  const currentPrice = pair.stats.lastPriceSwap.toString();
  // values
  const [baseValue, setBaseValue] = useState("");
  const [quoteValue, setQuoteValue] = useState("");
  const [lastUpdated, setLastUpdated] = useState<"base" | "quote">("base");

  function setValue(value: string, isBase: boolean) {
    if (value === "" || isNaN(Number(value))) {
      setQuoteValue("");
      setBaseValue("");
      return;
    }
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

  const txParams = () => ({
    lowerTick: selectedLowerTick,
    upperTick: selectedUpperTick,
    minPriceWei: defaultMinPrice,
    maxPriceWei: defaultMaxPrice,
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

  // validation
  const paramCheck = validateParams(txParams());

  return (
    <Container>
      <Spacer height="4px" />
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

      <Spacer height="10px" />

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
      <Spacer height="10px" />
      <Container className={styles.card}>
        <ModalItem
          name="Current Price"
          value={
            displayAmount(
              currentPrice,
              pair.base.decimals - pair.quote.decimals,
              {
                precision: 3,
              }
            ) +
            " " +
            pair.base.symbol +
            " = 1 " +
            pair.quote.symbol
          }
        />

        <ModalItem
          name="Min Price"
          value={displayAmount(
            defaultMinPrice,
            pair.base.decimals - pair.quote.decimals,
            {
              precision: 3,
            }
          )}
        />

        <ModalItem
          name="Max Price"
          value={displayAmount(
            defaultMaxPrice,
            pair.base.decimals - pair.quote.decimals,
            {
              precision: 3,
            }
          )}
        />

        <ModalItem
          name="Fee"
          value={
            <Container>
              <PopUp
                content={
                  <Text>Liquidity providers will receive fee on swaps</Text>
                }
                width="300px"
              >
                <Container
                  style={{ display: "flex", flexDirection: "row", gap: "6px" }}
                >
                  <Text>{formatPercent(pair.stats.feeRate.toString())}</Text>
                  <span className={styles.infoPop}>
                    <Text
                      theme="secondary-dark"
                      size="sm"
                      style={{
                        textAlign: "right",
                      }}
                    >
                      ?
                    </Text>
                  </span>
                </Container>
              </PopUp>
            </Container>
          }
        />
      </Container>
      <Spacer height="8px" />

      <Text size="x-sm" theme="secondary-dark">
        This is a concentrated liquidity stable pool. The default range above is
        selected for optimal rewards. Rewards will be released in weekly epochs.
      </Text>
      <Spacer height="8px" />
      <Button
        disabled={
          !paramCheck.isValid ||
          Number(baseValue) === 0 ||
          Number(quoteValue) === 0
        }
        width={"fill"}
        onClick={() => sendTxFlow(txParams())}
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
  minPriceWei: string;
  maxPriceWei: string;
  liquidity: string;
  txType: AmbientTxType.REMOVE_CONC_LIQUIDITY;
  positionId: string;
}
interface RemoveProps {
  pool: AmbientPool;
  sendTxFlow: (params: RemoveConcParams) => void;
  validateParams: (params: RemoveConcParams) => ValidationReturn;
}

const RemoveAmbientLiquidity = ({
  pool,
  validateParams,
  sendTxFlow,
}: RemoveProps) => {
  const [position, setPosition] = useState(pool.userPositions[0]);
  // percent state
  const [percentToRemove, setPercentToRemove] = useState(0);
  const liquidityToRemove = percentOfAmount(
    position.concLiq.toString(),
    percentToRemove
  );
  const defaultMinPrice = getPriceFromTick(position.bidTick);
  const defaultMaxPrice = getPriceFromTick(position.askTick);

  return (
    <div>
      <Spacer height="10px" />
      <Text>Select position to remove</Text>
      <Spacer height="10px" />
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        {pool.userPositions.map((pos, idx) => (
          <Button
            color={
              pos.positionId === position.positionId ? "accent" : "primary"
            }
            key={idx}
            onClick={() => setPosition(pos)}
            // width={"fill"}
            height={"large"}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                {`RANGE: ${displayAmount(
                  getPriceFromTick(pos.bidTick),
                  pool.base.decimals - pool.quote.decimals,
                  {
                    precision: 3,
                  }
                )}-${displayAmount(
                  getPriceFromTick(pos.askTick),
                  pool.base.decimals - pool.quote.decimals,
                  {
                    precision: 3,
                  }
                )}`}
              </div>
              <div>
                {`VALUE: ${displayAmount(
                  concLiquidityNoteValue(
                    pos.concLiq,
                    pool.stats.lastPriceSwap.toString(),
                    pos.bidTick,
                    pos.askTick,
                    new BigNumber(10).pow(36 - pool.base.decimals).toString(),
                    new BigNumber(10).pow(36 - pool.quote.decimals).toString()
                  ),
                  18
                )} $NOTE`}
              </div>
            </div>
          </Button>
        ))}
      </div>
      <Spacer height="20px" />
      <Container
        direction="row"
        backgroundColor="var(--card-surface-color)"
        gap={20}
        center={{
          horizontal: true,
          vertical: true,
        }}
        className={clsx(styles.card, styles.sliderContainer)}
      >
        <Slider
          value={percentToRemove}
          onChange={(val) => setPercentToRemove(val)}
          min={0}
          max={100}
          step={5}
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
      <Spacer height="40px" />

      <Text font="proto_mono" size="sm">
        Expected Tokens
      </Text>
      <Spacer height="6px" />

      <Container className={styles.card}>
        <ModalItem
          name={pool.base.symbol}
          value={displayAmount(
            baseTokenFromConcLiquidity(
              liquidityToRemove.data.toString(),
              pool.stats.lastPriceSwap.toString(),
              position.bidTick,
              position.askTick
            ),
            pool.base.decimals,
            {
              symbol: pool.base.symbol,
            }
          )}
        />
        <ModalItem
          name={pool.quote.symbol}
          value={displayAmount(
            quoteTokenFromConcLiquidity(
              liquidityToRemove.data.toString(),
              pool.stats.lastPriceSwap.toString(),
              position.bidTick,
              position.askTick
            ),
            pool.quote.decimals,
            {
              symbol: pool.quote.symbol,
            }
          )}
        />
      </Container>
      <Spacer height="80px" />

      <Button
        disabled={Number(percentToRemove) <= 0 || Number(percentToRemove) > 100}
        width={"fill"}
        onClick={() =>
          sendTxFlow({
            minPriceWei: defaultMinPrice,
            maxPriceWei: defaultMaxPrice,
            lowerTick: position.bidTick,
            upperTick: position.askTick,
            txType: AmbientTxType.REMOVE_CONC_LIQUIDITY,
            liquidity: liquidityToRemove.data.toString(),
            positionId: position.positionId,
          })
        }
      >
        Remove Liquidity
      </Button>
    </div>
  );
};
