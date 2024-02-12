import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import styles from "./tokenCard.module.scss";
import Container from "@/components/container/container";
import Item from "../item";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import Button from "@/components/button/button";
import { DottedItem } from "../dottedItem/dottedItem";

interface Props {
  cToken?: CTokenWithUserData;
  items: {
    key: string;
    value: string;
  }[];
  onClick: () => void;
}
const TokenCard = ({ cToken, items, onClick }: Props) => {
  if (!cToken) {
    return <div className={styles.loading}></div>;
  }
  return (
    <div className={styles.container}>
      <header>
        <Icon
          icon={{
            url: cToken.underlying.logoURI,
            size: 24,
          }}
        />
        <Text size="x-lg" font="proto_mono" color="#ddd">
          {cToken.underlying.symbol}
        </Text>
      </header>
      <section>
        <Container direction="row" gap={70}>
          <Item
            color="#333"
            name="supply apr"
            symbol
            value={cToken.supplyApr + "%"}
          />
          <Item
            color="#333"
            name="borrow apr"
            symbol
            value={cToken.borrowApr + "%"}
          />
        </Container>
        <Button fontFamily="proto_mono" onClick={onClick}>
          Get {cToken.underlying.symbol}
        </Button>
      </section>
      <div
        style={{
          padding: "0 20px",
        }}
      >
        <hr
          style={{
            borderColor: "#c9c9c9",
          }}
        />
      </div>

      <Container padding={"sm"} gap={16}>
        {items.map((item, i) => (
          <DottedItem key={i} name={item.key} value={item.value} />
        ))}
      </Container>
    </div>
  );
};

export default TokenCard;
