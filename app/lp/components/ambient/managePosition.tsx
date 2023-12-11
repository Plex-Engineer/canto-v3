import styles from "../dexModals/cantoDex.module.scss";

import {
  AmbientPool,
  AmbientUserPosition,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import Tabs from "@/components/tabs/tabs";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { useState } from "react";
import { getPriceFromTick } from "@/utils/ambient";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import clsx from "clsx";
import Slider from "@/components/slider/slider";
import Input from "@/components/input/input";
import { displayAmount, formatPercent } from "@/utils/formatting";
import { ModalItem } from "@/app/lending/components/modal/modal";
import Button from "@/components/button/button";
import Amount from "@/components/amount/amount";
import PopUp from "@/components/popup/popup";
import { Validation } from "@/config/interfaces";
import { AmbientTransactionParams } from "@/transactions/pairs/ambient";
import { AmbientPositionManager } from "@/utils/ambient/liquidityControllers";

interface ManagePostionProps {
  pool: AmbientPool;
  position: AmbientUserPosition;
  verifyParams: (params: Partial<AmbientTransactionParams>) => Validation;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}
export const ManageAmbientPosition = ({
  pool,
  position,
  sendTxFlow,
  verifyParams,
}: ManagePostionProps) => {
  const positionManager = new AmbientPositionManager(pool, position);

  const PoolHeader = () => (
    <div className={styles.iconTitle}>
      <Icon icon={{ url: pool.logoURI, size: 60 }} />
      <Text size="lg" font="proto_mono">
        {pool.symbol}
      </Text>
    </div>
  );
  return (
    <Tabs
      tabs={[
        {
          title: "Add",
          content: (
            <Container
              width="100%"
              className={styles["scroll-view"]}
              key={pool.address + "add"}
            >
              <Container
                gap={16}
                style={{
                  padding: "0 16px",
                }}
              >
                <PoolHeader />
                <AddLiquidity
                  positionManager={positionManager}
                  sendTxFlow={sendTxFlow}
                  verifyParams={verifyParams}
                />
              </Container>
            </Container>
          ),
        },
        {
          title: "Remove",
          content: (
            <Container
              width="100%"
              className={styles["scroll-view"]}
              key={pool.address + "remove"}
            >
              <Container
                gap={16}
                style={{
                  padding: "0 16px",
                }}
              >
                <PoolHeader />
                <RemoveLiquidity
                  positionManager={positionManager}
                  sendTxFlow={sendTxFlow}
                  verifyParams={verifyParams}
                />
              </Container>
              <Spacer height="20px" />
            </Container>
          ),
        },
      ]}
    />
  );
};

interface ManageProps {
  positionManager: AmbientPositionManager;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
  verifyParams: (params: Partial<AmbientTransactionParams>) => Validation;
}

const AddLiquidity = ({
  positionManager,
  sendTxFlow,
  verifyParams,
}: ManageProps) => {
  const { pool } = positionManager;
  const [amountBase, setAmountBase] = useState("");
  const [amountQuote, setAmountQuote] = useState("");
  const [lastUpdate, setLastUpdate] = useState<"base" | "quote">("base");
  const positionValues = positionManager.displayPositionValues();
  const [minExecutionPrice, setMinExecutionPrice] = useState(
    positionManager.getFormattedPrice(
      getPriceFromTick(positionManager.position.bidTick)
    )
  );
  const [maxExecutionPrice, setMaxExecutionPrice] = useState(
    positionManager.getFormattedPrice(
      getPriceFromTick(positionManager.position.askTick)
    )
  );
  // pack the params into a single object
  const userParams = {
    nonWeiAmount: lastUpdate === "base" ? amountBase : amountQuote,
    isBase: lastUpdate === "base",
    nonWeiMinExecutionPrice: minExecutionPrice,
    nonWeiMaxExecutionPrice: maxExecutionPrice,
  };
  const validParams = verifyParams(
    positionManager.createAddConcLiquidtyParams(userParams)
  );

  return (
    <Container>
      <Amount
        decimals={pool.base.decimals}
        value={amountBase}
        onChange={(e) => {
          setLastUpdate("base");
          setAmountBase(e.target.value);
          setAmountQuote(
            positionManager.getAmountFromAmountFormatted(e.target.value, true)
          );
        }}
        IconUrl={pool.base.logoURI}
        title={pool.base.symbol}
        min="0"
        max={pool.base.balance ?? "0"}
        symbol={pool.base.symbol}
      />
      <Spacer height="10px" />
      <Amount
        decimals={pool.quote.decimals}
        value={amountQuote}
        onChange={(e) => {
          setLastUpdate("quote");
          setAmountQuote(e.target.value);
          setAmountBase(
            positionManager.getAmountFromAmountFormatted(e.target.value, false)
          );
        }}
        IconUrl={pool.quote.logoURI}
        title={pool.quote.symbol}
        max={pool.quote.balance ?? "0"}
        min="0"
        symbol={pool.quote.symbol}
      />
      <Spacer height="10px" />
      <Container className={styles.card}>
        <ModalItem
          name="Current Price"
          value={
            displayAmount(
              pool.stats.lastPriceSwap.toString(),
              pool.base.decimals - pool.quote.decimals,
              {
                precision: 3,
              }
            ) +
            " " +
            pool.base.symbol +
            " = 1 " +
            pool.quote.symbol
          }
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
                  <Text>{formatPercent(pool.stats.feeRate.toString())}</Text>
                </Container>
              </PopUp>
            </Container>
          }
        />
      </Container>
      <Spacer height="8px" />
      <Container className={styles.card}>
        <ModalItem name="Min Price" value={positionValues.lowerPrice} />
        <ModalItem name="Max Price" value={positionValues.upperPrice} />
        <ModalItem
          name="Min Execution Price: "
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={10}
              direction="row"
              style={{
                width: "100px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                value={minExecutionPrice}
                onChange={(e) => setMinExecutionPrice(e.target.value)}
              />
            </Container>
          }
        />
        <ModalItem
          name="Max Execution Price: "
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={10}
              direction="row"
              style={{
                width: "100px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                value={maxExecutionPrice}
                onChange={(e) => setMaxExecutionPrice(e.target.value)}
              />
            </Container>
          }
        />
      </Container>
      <Spacer height="20px" />
      <Button
        disabled={validParams.error}
        width={"fill"}
        onClick={() =>
          sendTxFlow(positionManager.createAddConcLiquidtyParams(userParams))
        }
      >
        {validParams.error ? validParams.reason : "Add Liquidity"}
      </Button>
      <Spacer height="20px" />
    </Container>
  );
};

const RemoveLiquidity = ({
  positionManager,
  sendTxFlow,
  verifyParams,
}: ManageProps) => {
  const { pool } = positionManager;
  const [percentToRemove, setPercentToRemove] = useState(0);
  const [minExecutionPrice, setMinExecutionPrice] = useState(
    positionManager.getFormattedPrice(
      getPriceFromTick(positionManager.position.bidTick)
    )
  );
  const [maxExecutionPrice, setMaxExecutionPrice] = useState(
    positionManager.getFormattedPrice(
      getPriceFromTick(positionManager.position.askTick)
    )
  );

  const expectedTokens =
    positionManager.getExpectedRemovedTokens(percentToRemove);

  // pack the params into a single object
  const userParams = {
    percentToRemove,
    nonWeiMinExecutionPrice: minExecutionPrice,
    nonWeiMaxExecutionPrice: maxExecutionPrice,
  };
  const validParams = verifyParams(
    positionManager.createRemoveConcentratedLiquidtyParams(userParams)
  );

  return (
    <Container>
      <Spacer height="10px" />
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
          value={displayAmount(expectedTokens.base, pool.base.decimals, {
            symbol: pool.base.symbol,
          })}
        />
        <ModalItem
          name={pool.quote.symbol}
          value={displayAmount(expectedTokens.quote, pool.quote.decimals, {
            symbol: pool.quote.symbol,
          })}
        />
        <ModalItem
          name="Min Execution Price: "
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={10}
              direction="row"
              style={{
                width: "100px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                value={minExecutionPrice}
                onChange={(e) => setMinExecutionPrice(e.target.value)}
              />
            </Container>
          }
        />
        <ModalItem
          name="Max Execution Price: "
          value={
            <Container
              center={{
                vertical: true,
              }}
              gap={10}
              direction="row"
              style={{
                width: "100px",
              }}
            >
              <Input
                height={"sm"}
                type="number"
                value={maxExecutionPrice}
                onChange={(e) => setMaxExecutionPrice(e.target.value)}
              />
            </Container>
          }
        />
      </Container>
      <Spacer height="20px" />

      <Button
        disabled={validParams.error}
        width={"fill"}
        onClick={() =>
          sendTxFlow(
            positionManager.createRemoveConcentratedLiquidtyParams(userParams)
          )
        }
      >
        {validParams.error ? validParams.reason : "Remove Liquidity"}
      </Button>
    </Container>
  );
};
