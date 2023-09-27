import styles from "./item.module.scss";
import Text from "@/components/text";

type ItemProps = {
  name: string;
  value: string;
  postChild?: React.ReactNode;
  theme?:
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark"
    | undefined;
};

const Item = ({ name, value, theme, postChild }: ItemProps) => (
  <div className={styles.item}>
    <Text className={styles.title} theme={theme} font="proto_mono">
      {name}
    </Text>
    <Text className={styles.value} theme={theme} font="proto_mono">
      {value}{" "}
      {postChild && <span className={styles.postChild}>{postChild}</span>}
    </Text>
  </div>
);

export default Item;
