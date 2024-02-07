import styles from "./separator.module.scss";

interface Props {
  percentages?: number[];
}

const Separator = ({ percentages }: Props) => {
  return <div className={styles.container}>Separator</div>;
};

export default Separator;
