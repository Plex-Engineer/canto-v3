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
    <div className={styles.container}>
      <Text size="x-lg" font="proto_mono" color="#ddd">
        {props.title}
      </Text>
      <div className={styles.separator}></div>
      <div className={styles.items}>
        {props.items.map((item, i) => (
          <Item key={i} {...item} />
        ))}
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${props.percent * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AccountHealth;
