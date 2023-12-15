import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import {
  AmbientPool,
  AmbientUserPosition,
} from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { getPriceFromTick, concLiquidityNoteValue } from "@/utils/ambient";
import { displayAmount } from "@/utils/formatting";
import BigNumber from "bignumber.js";
import styles from "./dexModals/cantoDex.module.scss";
import Text from "@/components/text";
import { addTokenBalances } from "@/utils/math";

// Listing Positions
interface Props {
  pool: AmbientPool;
  positionValues: {
    baseAmount: string;
    baseValue: string;
    quoteAmount: string;
    quoteValue: string;
  }[];
  positions: AmbientUserPosition[];
}
export const HoverPositions = ({ pool, positionValues }: Props) => (
  <>
    <div
      className={styles["scroll-view"]}
      style={{
        height: "100%",
      }}
    >
      <Container gap={10} className={styles["items-list"]}>
        {positionValues.map((item, idx) => (
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
                Position {idx + 1}:
              </Text>

              <Text size="x-sm" font="proto_mono">
                {displayAmount(
                  addTokenBalances(item.baseValue, item.quoteValue),
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
                <Icon icon={{ url: pool.base.logoURI, size: 12 }} themed />
                {`${pool.base.symbol}: `}
                {displayAmount(item.baseAmount, pool.base.decimals, {
                  precision: 2,
                })}
              </Text>
              <Text
                size="x-sm"
                font="proto_mono"
                style={{
                  lineBreak: "anywhere",
                }}
              >
                <Icon icon={{ url: pool.quote.logoURI, size: 12 }} themed />
                {`${pool.quote.symbol}: `}
                {displayAmount(item.quoteAmount, pool.quote.decimals, {
                  precision: 2,
                })}
              </Text>
            </Container>
          </Container>
        ))}
      </Container>
    </div>
  </>
);
