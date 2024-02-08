import Text from "@/components/text";
import styles from "./dotted.module.scss";
interface DotProps {
  name: string;
  value: string;
}
export const DottedItem = ({ name, value }: DotProps) => {
  return (
    <div className={styles.container}>
      <Text size="sm" font="proto_mono" color="#333">
        {name}
      </Text>
      <div className={styles.dot}></div>
      <Text size="sm" font="proto_mono" color="#333">
        {value}
      </Text>
    </div>
  );
};
