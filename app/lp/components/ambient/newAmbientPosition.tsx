import styles from "../cantoDex.module.scss";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import useNewAmbientPositionManager from "@/hooks/pairs/newAmbient/liquidityControllers/newPositionManager.ts";
import Container from "@/components/container/container";
import Amount from "@/components/amount/amount";
import Spacer from "@/components/layout/spacer";
import { displayAmount, formatBalance } from "@/utils/tokenBalances.utils";
import { ModalItem } from "@/app/lending/components/modal/modal";
import PopUp from "@/components/popup/popup";
import { formatPercent } from "@/utils/formatting.utils";
import Input from "@/components/input/input";
import Button from "@/components/button/button";
import Toggle from "@/components/toggle";
import { useEffect, useState } from "react";
import ToggleGroup from "@/components/ToggleGroup/ToggleGroup";
import Price from "@/components/price/price";
import SVGComponent from "../svgComponent";
import {
  ALL_TICK_KEYS,
  TickRangeKey,
} from "@/hooks/pairs/newAmbient/liquidityControllers/defaultParams";
import { queryAmbientPoolLiquidityCurve } from "@/hooks/pairs/newAmbient/helpers/ambientApi";
import { convertLiquidityCurveToGraph } from "@/utils/ambient/graphing.utils";

interface NewPositionModalProps {
  pool: AmbientPool;
  sendTxFlow: (params: Partial<AmbientTransactionParams>) => void;
}
export const NewAmbientPositionModal = ({
  pool,
  sendTxFlow,
}: NewPositionModalProps) => {
  const { base: baseToken, quote: quoteToken } = pool;
  const positionManager = useNewAmbientPositionManager(pool);
  const positionValidation = positionManager.txParams.validateParams();

  // modal options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TickRangeKey>("DEFAULT");
  function setDefaultParams(tickKey: TickRangeKey) {
    setSelectedOption(tickKey);
    positionManager.setters.setDefaultParams(tickKey);
  }
  // liquidity graph
  const [graphPoints, setGraphPoints] = useState<{ x: number; y: number }[]>(
    []
  );
  useEffect(() => {
    async function getGraph() {
      const { data: curve, error } = await queryAmbientPoolLiquidityCurve(
        pool.base.chainId,
        pool.base.address,
        pool.quote.address,
        pool.poolIdx
      );
      if (error) console.log(error);
      setGraphPoints(convertLiquidityCurveToGraph(pool, curve));
    }
    getGraph();
  }, [pool]);

  return (
    <Container width={showAdvanced ? "64rem" : "32rem"}>
      <Container direction="row" gap={20}>
        <Container>
          <Container
            direction="row"
            gap={"auto"}
            center={{
              horizontal: true,
              vertical: true,
            }}
            width="100%"
          >
            <Text size="lg">Deposit Amounts</Text>
            <Container
              direction="row"
              center={{
                horizontal: true,
                vertical: true,
              }}
              gap={10}
            >
              <Text theme="secondary-dark" size="x-sm">
                Advanced
              </Text>{" "}
              <Toggle value={showAdvanced} onChange={setShowAdvanced} />
            </Container>
          </Container>
          <Spacer height="10px" />
          <div className={styles.iconTitle}>
            <Icon icon={{ url: pool.logoURI, size: 60 }} />
            <Text size="lg" font="proto_mono">
              {pool.symbol}
            </Text>
          </div>

          <Spacer height="10px" />
          <Amount
            decimals={baseToken.decimals}
            value={positionManager.options.amountBase}
            onChange={(e) =>
              positionManager.setters.setAmount(e.target.value, true)
            }
            IconUrl={baseToken.logoURI}
            title={baseToken.symbol}
            max={baseToken.balance ?? "0"}
            symbol={baseToken.symbol}
          />
          <Spacer height="12px" />
          <Amount
            decimals={quoteToken.decimals}
            value={positionManager.options.amountQuote}
            onChange={(e) =>
              positionManager.setters.setAmount(e.target.value, false)
            }
            IconUrl={quoteToken.logoURI}
            title={quoteToken.symbol}
            max={quoteToken.balance ?? "0"}
            symbol={quoteToken.symbol}
          />
          <Spacer height="20px" />
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
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "6px",
                      }}
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
                      <Text>
                        {formatPercent(pool.stats.feeRate.toString())}
                      </Text>
                    </Container>
                  </PopUp>
                </Container>
              }
            />
          </Container>
          <Spacer height="8px" />
          <Text size="x-sm" theme="secondary-dark">
            This is a concentrated liquidity stable pool. The default range
            below is selected for optimal rewards. Rewards will be released in
            weekly epochs.
          </Text>
          <Spacer height="8px" />

          {!showAdvanced && (
            <Container className={styles.card}>
              <ModalItem
                name="Min Range Price: "
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
                      value={positionManager.options.minRangePrice}
                      onChange={(e) =>
                        positionManager.setters.setRangePrice({
                          min: e.target.value,
                        })
                      }
                    />
                  </Container>
                }
              />
              <ModalItem
                name="Max Range Price: "
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
                      value={positionManager.options.maxRangePrice}
                      onChange={(e) =>
                        positionManager.setters.setRangePrice({
                          max: e.target.value,
                        })
                      }
                    />
                  </Container>
                }
              />
            </Container>
          )}
        </Container>

        {showAdvanced && (
          <Container className={styles.advancedContainer}>
            <Text>Set Price Range</Text>
            <Spacer height="8px" />
            <div className={styles.priceRanger}>
              <SVGComponent
                axis={{
                  x: {
                    min: 0.988,
                    max: 1.01,
                  },
                }}
                points={graphPoints}
                currentPrice={formatBalance(pool.stats.lastPriceSwap, -12)}
                minPrice={positionManager.options.minRangePrice}
                maxPrice={positionManager.options.maxRangePrice}
                setPrice={(min, max) =>
                  positionManager.setters.setRangePrice({ min, max })
                }
              />
            </div>
            <Spacer height="8px" />
            <ToggleGroup
              options={ALL_TICK_KEYS}
              selected={selectedOption}
              setSelected={(tickKey) =>
                setDefaultParams(tickKey as TickRangeKey)
              }
            />
            <Spacer height="16px" />
            <Container direction="row">
              <Price
                title="Min Range Price"
                price={positionManager.options.minRangePrice}
                onPriceChange={(price) => {
                  positionManager.setters.setRangePrice({ min: price });
                }}
                description={pool.base.symbol + " per " + pool.quote.symbol}
              />
              <Spacer width="32px" />
              <Price
                title="Max Range Price"
                price={positionManager.options.maxRangePrice}
                onPriceChange={(price) => {
                  positionManager.setters.setRangePrice({ max: price });
                }}
                description={pool.base.symbol + " per " + pool.quote.symbol}
              />
            </Container>
          </Container>
        )}
      </Container>
      <Spacer height="30px" />
      <Button
        disabled={!positionValidation.isValid}
        width={"fill"}
        onClick={() => sendTxFlow(positionManager.txParams.addLiquidity())}
      >
        Add Concentrated Liquidity
      </Button>
      <Spacer height="30px" />
    </Container>
  );
};
