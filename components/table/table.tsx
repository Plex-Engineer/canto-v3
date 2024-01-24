import React from "react";
import Text from "../text";
import styles from "./table.module.scss";

interface Props {
  title?: string;
  secondary?: React.ReactNode;
  headers: {
    value: string | React.ReactNode;
    ratio: number;
  }[];
  content: React.ReactNode[][] | React.ReactNode[];
  textSize?: string;
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
              <div key={index} className={styles.cell}>
                {header.value}
              </div>
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
                }}
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
