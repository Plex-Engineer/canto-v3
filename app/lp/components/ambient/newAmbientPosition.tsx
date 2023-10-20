import styles from "../cantoDex.module.scss";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import useNewAmbientPositionManager from "@/hooks/pairs/newAmbient/liquidityControllers/newPositionManager.ts";
import Container from "@/components/container/container";
import Amount from "@/components/amount/amount";
import Spacer from "@/components/layout/spacer";
import { displayAmount } from "@/utils/tokenBalances.utils";
import { ModalItem } from "@/app/lending/components/modal/modal";
import PopUp from "@/components/popup/popup";
import { formatPercent } from "@/utils/formatting.utils";
import Input from "@/components/input/input";
import Button from "@/components/button/button";

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
  return (
    <Container>
      <div className={styles.iconTitle}>
        <Icon icon={{ url: pool.logoURI, size: 60 }} />
        <Text size="lg" font="proto_mono">
          {pool.symbol}
        </Text>
      </div>

      <Spacer height="4px" />
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
      <Spacer height="10px" />
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
        This is a concentrated liquidity stable pool. The default range below is
        selected for optimal rewards. Rewards will be released in weekly epochs.
      </Text>
      <Spacer height="8px" />
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
                onChange={(e) => {
                  positionManager.setters.setRangePrice(e.target.value, true);
                }}
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
                onChange={(e) => {
                  positionManager.setters.setRangePrice(e.target.value, false);
                }}
              />
            </Container>
          }
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
                value={positionManager.options.minExecutionPrice}
                onChange={(e) => {
                  positionManager.setters.setExecutionPrice(
                    e.target.value,
                    true
                  );
                }}
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
                value={positionManager.options.maxExecutionPrice}
                onChange={(e) => {
                  positionManager.setters.setExecutionPrice(
                    e.target.value,
                    false
                  );
                }}
              />
            </Container>
          }
        />
      </Container>
      <Text
        style={{
          opacity: !positionValidation.isValid ? 1 : 0,
          color: "var(--extra-failure-color, #ff0000)",
        }}
        size="x-sm"
      >
        {positionValidation.errorMessage}
      </Text>
      <Spacer height="30px" />
      <Button
        disabled={!positionValidation.isValid}
        width={"fill"}
        onClick={() => sendTxFlow(positionManager.txParams.addLiquidity())}
      >
        Add Concentrated Liquidity
      </Button>
    </Container>
  );
};
