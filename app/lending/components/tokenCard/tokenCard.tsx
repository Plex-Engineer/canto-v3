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
const TokenCard = ({ cToken, items }: Props) => {
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
        <Text size="x-lg" font="proto_mono" theme="primary-light">
          {cToken.underlying.symbol}
        </Text>
      </header>
      <section>
        <Container direction="row" gap={70}>
          <Item name="supply apy" symbol value={cToken.supplyApy + "%"} />
          <Item name="borrow apy" symbol value={cToken.borrowApy + "%"} />
        </Container>
        <Button fontFamily="proto_mono">Get note</Button>
      </section>
      <div
        style={{
          padding: "0 20px",
        }}
      >
        <hr />
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
