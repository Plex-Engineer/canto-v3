import Text from "@/components/text";
import Item from "../item";
import styles from "./accountHealth.module.scss";
interface Props {
  title: string;
  items: {
    name: string | React.ReactNode;
    value: string;
    symbol?: boolean;
  }[];
  percent: number;
}

const AccountHealth = (props: Props) => {
  return (
    <div>
      <Text size="lg" font="proto_mono">
        {props.title}
      </Text>
      <div className={styles.items}>
        {props.items.map((item, i) => (
          <Item key={i} {...item} />
        ))}
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${props.percent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AccountHealth;
