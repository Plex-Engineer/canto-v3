import Text from "../text";
import styles from "./price.module.scss";

interface Props {
  title: string;
  price: string;
  onPriceChange: (price: string) => void;
  description: string;
}
const Price = (props: Props) => {
  return (
    <div className={styles.container}>
      <Text>{props.title}</Text>
      <input
        value={props.price}
        onChange={(e) => props.onPriceChange(e.target.value)}
      />
      <Text>{props.description}</Text>
    </div>
  );
};

export default Price;
