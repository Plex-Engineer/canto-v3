"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import { displayAmount } from "@/utils/tokenBalances.utils";
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
import {
  AmbientPool,
  AmbientUserPosition,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import {
  AmbientTransactionParams,
  AmbientTxType,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { getPriceFromTick } from "@/utils/ambient/ambientMath.utils";
import {
  baseTokenFromConcLiquidity,
  concLiquidityNoteValue,
  quoteTokenFromConcLiquidity,
} from "@/utils/ambient/liquidity.utils";
import { formatPercent } from "@/utils/formatting.utils";
import BigNumber from "bignumber.js";
import useAddAmbientLiquidityController from "@/hooks/pairs/newAmbient/useAmbientLiqController";

interface AmbientModalProps {
  pool: AmbientPool;
  validateParams: (
    params: Partial<AmbientTransactionParams>
  ) => ValidationReturn;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}

export const AmbientModal = (props: AmbientModalProps) => {
  const [selectedPosition, setSelectedPosition] = useState<
    AmbientUserPosition | null | "new"
  >(null);

  const PoolHeader = () => (
    <div className={styles.iconTitle}>
      <Icon icon={{ url: props.pool.logoURI, size: 60 }} />
      <Text size="lg" font="proto_mono">
        {props.pool.symbol}
      </Text>
    </div>
  );
  return (
    <Container className={styles.container} width="32rem">
      {/* title */}
      <div>
        <Container
          direction="row"
          height="24px"
          center={{
            vertical: true,
          }}
        >
          <Text font="proto_mono" size="lg">
            {props.pool.userPositions.length === 0 || selectedPosition === "new"
              ? "Create New Position"
              : selectedPosition === null
              ? "Your Positions"
              : "Manage Position"}
          </Text>
        </Container>
        <Spacer height="14px" />
      </div>
      <div className={styles.inner}>
        {props.pool.userPositions.length === 0 || selectedPosition === "new" ? (
          <>
            <PoolHeader />
            <AddAmbientLiquidity
              pool={props.pool}
              sendTxFlow={props.sendTxFlow}
              validateParams={props.validateParams}
            />
          </>
        ) : !selectedPosition ? (
          <Container height="calc(100% - 0px)">
            <PoolHeader />
            <div className={styles["scroll-view"]}>
              <PositionList
                pool={props.pool}
                positions={props.pool.userPositions}
                setSelectedPosition={setSelectedPosition}
              />
            </div>
            <div
              style={{
                margin: "1rem",
              }}
            >
              <Button
                width={"fill"}
                onClick={() => {
                  setSelectedPosition("new");
                }}
              >
                New Position
              </Button>
            </div>
          </Container>
        ) : (
          <Tabs
            tabs={[
              {
                title: "Add",
                content: (
                  <Container
                    width="100%"
                    margin="sm"
                    className={styles["scroll-view"]}
                  >
                    <PoolHeader />
                    <AddAmbientLiquidity
                      position={selectedPosition}
                      pool={props.pool}
                      sendTxFlow={props.sendTxFlow}
                      validateParams={props.validateParams}
                    />
                  </Container>
                ),
              },
              {
                title: "Remove",
                content: (
                  <Container
                    width="100%"
                    margin="sm"
                    className={styles["scroll-view"]}
                  >
                    <PoolHeader />
                    <RemoveAmbientLiquidity
                      position={selectedPosition}
                      pool={props.pool}
                      sendTxFlow={props.sendTxFlow}
                      validateParams={props.validateParams}
                    />
                  </Container>
                ),
              },
            ]}
          />
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
  pool: AmbientPool;
  position?: AmbientUserPosition;
  sendTxFlow: (params: AddConcParams) => void;
  validateParams: (params: AddConcParams) => ValidationReturn;
}
const AddAmbientLiquidity = ({
  pool,
  position,
  validateParams,
  sendTxFlow,
}: AddModalProps) => {
  // get values from controller
  const { addLiqParamsWei, externalState } = useAddAmbientLiquidityController(
    pool,
    position
  );
  const txParams = () => ({
    lowerTick: addLiqParamsWei.lowerTick,
    upperTick: addLiqParamsWei.upperTick,
    minPriceWei: addLiqParamsWei.minPriceWei,
    maxPriceWei: addLiqParamsWei.maxPriceWei,
    txType: AmbientTxType.ADD_CONC_LIQUIDITY,
    amount:
      addLiqParamsWei.lastUpdatedToken === "base"
        ? addLiqParamsWei.amountBaseWei
        : addLiqParamsWei.amountQuoteWei,
    isAmountBase: addLiqParamsWei.lastUpdatedToken === "base",
  });

  // validation
  const paramCheck = validateParams(txParams());

  return (
    <Container>
      <Spacer height="4px" />
      <Amount
        decimals={pool.base.decimals}
        value={externalState.amountBase}
        onChange={(e) => {
          externalState.setAmount(e.target.value, true);
        }}
        IconUrl={pool.base.logoURI}
        title={pool.base.symbol}
        max={pool.base.balance ?? "0"}
        symbol={pool.base.symbol}
        error={
          !paramCheck.isValid &&
          Number(externalState.amountBase) !== 0 &&
          paramCheck.errorMessage?.startsWith(pool.base.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />

      <Spacer height="10px" />

      <Amount
        decimals={pool.quote.decimals}
        value={externalState.amountQuote}
        onChange={(e) => {
          externalState.setAmount(e.target.value, false);
        }}
        IconUrl={pool.quote.logoURI}
        title={pool.quote.symbol}
        max={pool.quote.balance ?? "0"}
        symbol={pool.quote.symbol}
        error={
          !paramCheck.isValid &&
          Number(externalState.amountQuote) !== 0 &&
          paramCheck.errorMessage?.startsWith(pool.quote.symbol)
        }
        errorMessage={paramCheck.errorMessage}
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

      <Text size="x-sm" theme="secondary-dark">
        This is a concentrated liquidity stable pool. The default range above is
        selected for optimal rewards. Rewards will be released in weekly epochs.
      </Text>
      <Spacer height="8px" />

      <Container className={styles.card}>
        <ModalItem
          name="Midpoint"
          value={
            position ? (
              displayAmount(
                addLiqParamsWei.midpointPriceWei,
                pool.base.decimals - pool.quote.decimals,
                {
                  precision: 3,
                }
              )
            ) : (
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
                  value={externalState.midpointPrice}
                  onChange={(e) => {
                    externalState.setMidpointPrice(e.target.value);
                  }}
                />
              </Container>
            )
          }
        />
        <ModalItem
          name="Min Price"
          value={displayAmount(
            addLiqParamsWei.minPriceWei,
            pool.base.decimals - pool.quote.decimals,
            {
              precision: 3,
            }
          )}
        />
        <ModalItem
          name="Max Price"
          value={displayAmount(
            addLiqParamsWei.maxPriceWei,
            pool.base.decimals - pool.quote.decimals,
            {
              precision: 3,
            }
          )}
        />
      </Container>
      <Spacer height="30px" />
      <Button
        disabled={
          !paramCheck.isValid ||
          Number(externalState.amountQuote) === 0 ||
          Number(externalState.amountBase) === 0
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
  position: AmbientUserPosition;
  sendTxFlow: (params: RemoveConcParams) => void;
  validateParams: (params: RemoveConcParams) => ValidationReturn;
}

const RemoveAmbientLiquidity = ({
  pool,
  position,
  sendTxFlow,
}: RemoveProps) => {
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

// Listing Positions
interface PositionListProps {
  pool: AmbientPool;
  positions: AmbientUserPosition[];
  setSelectedPosition: (position: AmbientUserPosition) => void;
}
const PositionList = ({
  pool,
  positions,
  setSelectedPosition,
}: PositionListProps) => (
  <Container margin="md" gap={20} className={styles["items-list"]}>
    {positions.map((item, idx) => (
      <Container
        key={idx}
        width="100%"
        gap={10}
        center={{
          horizontal: true,
        }}
        className={styles.item}
        onClick={() => {
          setSelectedPosition(item);
        }}
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
              pool.base.decimals - pool.quote.decimals,
              {
                precision: 3,
              }
            )}{" "}
            -{" "}
            {displayAmount(
              getPriceFromTick(item.askTick),
              pool.base.decimals - pool.quote.decimals,
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
              <Icon icon={{ url: pool.logoURI, size: 42 }} />
            </span>
          </Text>
          <Text size="md" font="proto_mono">
            {displayAmount(
              concLiquidityNoteValue(
                item.concLiq,
                pool.stats.lastPriceSwap.toString(),
                item.bidTick,
                item.askTick,
                new BigNumber(10).pow(36 - pool.base.decimals).toString(),
                new BigNumber(10).pow(36 - pool.quote.decimals).toString()
              ),
              18
            )}{" "}
            <Icon icon={{ url: "tokens/note.svg", size: 16 }} />
          </Text>
        </Container>
      </Container>
    ))}
  </Container>
);
