import Text from "../text";
import styles from "./table.module.scss";

interface Props {
  title?: string;
  headers: string[];
  data: string[][];
}

function formatTitle(title: string) {
  return title
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

const Table = (props: Props) => {
  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <Text font="proto_mono" size="lg">
          {props.title}
        </Text>
      </div>
      <div className={styles.row + " " + styles.header}>
        {props.headers.map((header, index) => {
          return (
            <div key={index} className={styles.cell}>
              <Text theme="secondary-dark">{formatTitle(header)}</Text>
            </div>
          );
        })}
      </div>
      {props.data.map((row, index) => {
        return (
          <div key={index} className={styles.row}>
            {row.map((cell, index) => {
              return (
                <div key={index} className={styles.cell}>
                  {cell}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Table;
