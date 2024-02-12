import Text from "../text";
import styles from "./table.module.scss";

interface Props {
  title?: string | React.ReactNode;
  secondary?: React.ReactNode;
  headerFont: "proto_mono" | "rm_mono";
  headers: {
    value: string | React.ReactNode;
    ratio: number;
  }[];
  content: React.ReactNode[][] | React.ReactNode[];
  textSize?: string;
  onRowsClick?: (() => void)[];
  isGovTable?: boolean;
}

const Table = (props: Props) => {
  return (
    <div className={styles.container} style={{ fontSize: props.textSize }}>
      <div className={styles.title}>
        <Text font="proto_mono" size="lg" opacity={0.7}>
          {props.title}
        </Text>
        {props.secondary}
      </div>
      <div className={styles.table}>
        <div
          className={styles.header}
          style={{
            gridTemplateColumns: props.headers
              .map((header) => {
                return `${header.ratio}fr`;
              })
              .join(" "),
          }}
        >
          {props.headers.map((header, index) => {
            return (
              <Text key={index} className={styles.cell} font={props.headerFont}>
                {header.value}
              </Text>
            );
          })}
        </div>
        <div className={styles.content}>
          {props.content.map((row, index) => {
            //check if an array has been passed in
            if (!Array.isArray(row)) {
              return row;
            }
            return (
              <div
                key={index}
                className={styles.row}
                style={{
                  gridTemplateColumns: props.headers
                    .map((header) => {
                      return `${header.ratio}fr`;
                    })
                    .join(" "),
                  cursor: props.onRowsClick ? "pointer" : undefined,
                  height: props.isGovTable ? "120px" : "80px",
                }}
                onClick={
                  props.onRowsClick ? props.onRowsClick[index] : undefined
                }
              >
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
      </div>
    </div>
  );
};

export default Table;
