import React from "react";
import Text from "../text";
import styles from "./table.module.scss";

interface Props {
  title?: string | React.ReactNode;
  secondary?: React.ReactNode;
  headers: {
    value: string | React.ReactNode;
    ratio: number;
  }[];
  content: React.ReactNode[][]; //| React.ReactNode[];
  textSize?: string;
}
const Table = (props: Props) => {
  //console.log(typeof(props.content));
  const isRowData: boolean = !props.content[0];
  //const isRowData = typeof(props.content)== React.ReactNode[];
  return (
    <div className={styles.container} style={{ fontSize: props.textSize }}>
      <div className={styles.title}>
        {/* <div font="proto_mono" size="lg"> */}
        {typeof props.title === "string" ? (
          <Text font="proto_mono" size="lg">
            {props.title}
          </Text>
        ) : (
          React.isValidElement(props.title) && props.title
        )}

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
                {Array.isArray(props.content[0]) ? (
                  row.map((cell, index) => {
                    return (
                      <div key={index} className={styles.cell}>
                        {cell}
                      </div>
                    );
                  })
                ) : (
                  <div></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
