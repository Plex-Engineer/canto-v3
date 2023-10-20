"use client";
import Button from "@/components/button/button";
import Spacer from "@/components/layout/spacer";
import { displayAmount } from "@/utils/tokenBalances.utils";
import { useState } from "react";
import Container from "@/components/container/container";
import { ValidationReturn } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import styles from "./cantoDex.module.scss";
import {
  AmbientPool,
  AmbientUserPosition,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { AmbientTransactionParams } from "@/hooks/pairs/newAmbient/interfaces/ambientPoolTxTypes";
import { getPriceFromTick } from "@/utils/ambient/ambientMath.utils";
import { concLiquidityNoteValue } from "@/utils/ambient/liquidity.utils";
import BigNumber from "bignumber.js";
import { NewAmbientPositionModal } from "./ambient/newAmbientPosition";
import { ManageAmbientPosition } from "./ambient/managePosition";

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

  type ModalState = "list" | "new" | "manage";
  const modalState: ModalState =
    props.pool.userPositions.length === 0 || selectedPosition === "new"
      ? "new"
      : !selectedPosition
      ? "list"
      : "manage";

  const title = () => {
    switch (modalState) {
      case "list":
        return "Your Positions";
      case "new":
        return "Create New Position";
      case "manage":
        return "Manage Position";
    }
  };

  return (
    <Container className={styles.container} width="32rem">
      <div>
        <Container
          direction="row"
          height="24px"
          center={{
            vertical: true,
          }}
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedPosition(null);
          }}
        >
          {selectedPosition !== null && (
            <div
              style={{
                rotate: "90deg",
                marginRight: "6px",
              }}
            >
              <Icon icon={{ url: "./dropdown.svg", size: 24 }} themed />
            </div>
          )}
          <Text font="proto_mono" size="lg">
            {title()}
          </Text>
        </Container>
        <Spacer height="14px" />
      </div>
      <div className={styles.inner}>
        {modalState === "list" && (
          <Container height="calc(100% - 0px)">
            <div className={styles.iconTitle}>
              <Icon icon={{ url: props.pool.logoURI, size: 60 }} />
              <Text size="lg" font="proto_mono">
                {props.pool.symbol}
              </Text>
            </div>
            <PositionList
              pool={props.pool}
              positions={props.pool.userPositions}
              setSelectedPosition={setSelectedPosition}
            />
          </Container>
        )}
        {modalState === "new" && (
          <Container
            width="100%"
            className={styles["scroll-view"]}
            style={{ padding: "0 1rem" }}
          >
            <NewAmbientPositionModal
              pool={props.pool}
              sendTxFlow={props.sendTxFlow}
            />
          </Container>
        )}
        {modalState === "manage" && (
          <ManageAmbientPosition
            pool={props.pool}
            position={selectedPosition as AmbientUserPosition}
            sendTxFlow={props.sendTxFlow}
          />
        )}
      </div>
    </Container>
  );
};

// Listing Positions
interface PositionListProps {
  pool: AmbientPool;
  positions: AmbientUserPosition[];
  setSelectedPosition: (position: AmbientUserPosition | "new") => void;
}
const PositionList = ({
  pool,
  positions,
  setSelectedPosition,
}: PositionListProps) => (
  <>
    <div className={styles["scroll-view"]}>
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
                    precision: 5,
                  }
                )}{" "}
                -{" "}
                {displayAmount(
                  getPriceFromTick(item.askTick),
                  pool.base.decimals - pool.quote.decimals,
                  {
                    precision: 5,
                  }
                )}
                )
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
  </>
);
