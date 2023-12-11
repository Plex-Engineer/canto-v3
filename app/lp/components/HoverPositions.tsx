import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import {
  AmbientPool,
  AmbientUserPosition,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { getPriceFromTick, concLiquidityNoteValue } from "@/utils/ambient";
import { displayAmount } from "@/utils/formatting";
import BigNumber from "bignumber.js";
import styles from "./dexModals/cantoDex.module.scss";
import Text from "@/components/text";

// Listing Positions
interface Props {
  pool: AmbientPool;
  positions: AmbientUserPosition[];
}
export const HoverPositions = ({ pool, positions }: Props) => (
  <>
    <div
      className={styles["scroll-view"]}
      style={{
        height: "100%",
      }}
    >
      <Container gap={10} className={styles["items-list"]}>
        {positions.map((item, idx) => (
          <Container
            key={idx}
            direction="row"
            width="100%"
            gap={10}
            center={{
              horizontal: true,
            }}
            className={styles["non-item"]}
          >
            <Container
              direction="column"
              gap={10}
              width="100%"
              style={{
                alignItems: "flex-start",
              }}
            >
              <Text
                size="x-sm"
                font="proto_mono"
                style={{
                  lineBreak: "anywhere",
                }}
              >
                {idx + 1}) Range:
              </Text>

              <Text size="x-sm" font="proto_mono">
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
                <Icon icon={{ url: "tokens/note.svg", size: 12 }} themed />
              </Text>
            </Container>
            <Container
              direction="column"
              gap={10}
              width="100%"
              style={{
                alignItems: "flex-end",
              }}
            >
              <Text
                size="x-sm"
                font="proto_mono"
                style={{
                  lineBreak: "anywhere",
                }}
              >
                min :{" "}
                {displayAmount(
                  getPriceFromTick(item.askTick),
                  pool.base.decimals - pool.quote.decimals,
                  {
                    precision: 5,
                  }
                )}
              </Text>
              <Text
                size="x-sm"
                font="proto_mono"
                style={{
                  lineBreak: "anywhere",
                }}
              >
                max:{" "}
                {displayAmount(
                  getPriceFromTick(item.askTick),
                  pool.base.decimals - pool.quote.decimals,
                  {
                    precision: 5,
                  }
                )}
              </Text>
            </Container>
          </Container>
        ))}
      </Container>
    </div>
  </>
);
