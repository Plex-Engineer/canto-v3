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
  function getColor() {
    if (props.percent < 0.95) {
      return "green";
    } else if (props.percent < 0.98) {
      return "yellow";
    }
    return "red";
  }

  return (
    <div className={styles.container}>
      <Text size="x-lg" font="proto_mono" color="#ddd">
        {props.title}
      </Text>
      <div className={styles.separator}></div>
      <div className={styles.items}>
        {props.items.map((item, i) => (
          <Item color="#ddd" key={i} {...item} />
        ))}
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{
            width: `${props.percent * 100}%`,
            backgroundColor: getColor(),
          }}
        ></div>
      </div>
    </div>
  );
};

export default AccountHealth;
