import { headers } from "next/dist/client/components/headers";
import Text from "../text";
import styles from "./table.module.scss";
import { useEffect, useState } from "react";

interface Props {
  title?: string;
  headers: string[];
  columns: number;
  data: any[][];
}

function formatTitle(title: string) {
  return title
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

const Table = (props: Props) => {
  return (
    <div
      className={styles.table}
      style={
        {
          "--table-columns": props.columns,
        } as React.CSSProperties
      }
    >
      <div className={styles.title}>
        <Text font="proto_mono" size="lg">
          {props.title}
        </Text>
      </div>
      <section className={styles.grid}>
        <div className={styles.row + " " + styles.header}>
          {props.headers.map((header, index) => {
            return (
              <div key={index} className={styles.cell}>
                <Text theme="secondary-dark" size="sm">
                  {formatTitle(header)}
                </Text>
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
      </section>
    </div>
  );
};

export default Table;
