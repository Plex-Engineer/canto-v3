import Text from "../text";
import styles from "./table.module.scss";
interface Props {
  title?: string;
  headers: string[];
  columns: number;
  data?: any[][];
}

function formatTitle(title: string) {
  return title
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

const Table = (props: Props) => {
  return (
    <div className={styles.tableCard}>
      <div className={styles.title}>
        <Text font="proto_mono" size="lg">
          {props.title}
        </Text>
      </div>
      <table className={styles.table}>
        <tr className={styles.row + " " + styles.header}>
          {props.headers.map((header, index) => (
            <td
              key={index}
              className={styles.cell}
              style={{ padding: "0 35px" }}
            >
              <Text theme="secondary-dark" size="sm">
                {formatTitle(header)}
              </Text>
            </td>
          ))}
        </tr>
        {props.data?.map((row, index) => (
          <tr key={index} className={styles.row}>
            {row.map((cell, index) => (
              <td key={index} className={styles.cell}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Table;
