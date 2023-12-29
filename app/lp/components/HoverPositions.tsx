import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import { displayAmount } from "@/utils/formatting";
import styles from "./dexModals/cantoDex.module.scss";
import Text from "@/components/text";
import { addTokenBalances } from "@/utils/math";

type TokenPosition = {
  amount: string;
  value: string;
  symbol: string;
  decimals: number;
  icon: string;
};
// Listing Positions
interface Props {
  positions: {
    token1: TokenPosition;
    token2: TokenPosition;
  }[];
}
export const HoverPositions = ({ positions }: Props) => (
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
                Position {idx + 1}:
              </Text>

              <Text size="x-sm" font="proto_mono">
                {displayAmount(
                  addTokenBalances(item.token1.value, item.token2.value),
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
                <Icon icon={{ url: item.token1.icon, size: 12 }} themed />
                {`${item.token1.symbol}: `}
                {displayAmount(item.token1.amount, item.token1.decimals, {
                  precision: 2,
                  maxSmallBalance: 0.01,
                })}
              </Text>
              <Text
                size="x-sm"
                font="proto_mono"
                style={{
                  lineBreak: "anywhere",
                }}
              >
                <Icon icon={{ url: item.token2.icon, size: 12 }} themed />
                {`${item.token2.symbol}: `}
                {displayAmount(item.token2.amount, item.token2.decimals, {
                  precision: 2,
                  maxSmallBalance: 0.01,
                })}
              </Text>
            </Container>
          </Container>
        ))}
      </Container>
    </div>
  </>
);
