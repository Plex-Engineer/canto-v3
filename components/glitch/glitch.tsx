import styles from "./glitch.module.scss";

interface Props {
  children: React.ReactNode;
}
const Glitch = (props: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.glitch__img}>{props.children}</div>
      <div className={styles["glitch__img--alt"]}>{props.children}</div>
      <div className={styles["glitch__img--alt2"]}>{props.children}</div>
      <div className={styles["glitch__img--alt3"]}>{props.children}</div>
    </div>
  );
};

export default Glitch;
