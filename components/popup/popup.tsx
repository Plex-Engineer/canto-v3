import styles from "./popup.module.scss";

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
  width: string;
}
const PopUp = ({ children, content, width }: Props) => {
  return (
    <span className={styles.item}>
      {children}
      <div
        className={styles.caption}
        style={{
          width: width,
        }}
      >
        {content}
      </div>
    </span>
  );
};

export default PopUp;
