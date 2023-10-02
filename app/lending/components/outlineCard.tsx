import styles from "./outlineCard.module.scss";
interface Props {
  children: React.ReactNode;
}
const OutlineCard = (props: Props) => {
  return <div className={styles.container}>{props.children}</div>;
};

export default OutlineCard;
