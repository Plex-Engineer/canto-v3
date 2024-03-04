import Text from "../text";
import styles from "./table.module.scss";
import useScreenSize from "@/hooks/helpers/useScreenSize";

interface Props {
  title?: string | React.ReactNode;
  secondary?: React.ReactNode;
  headerFont: "proto_mono" | "rm_mono";
  headers: {
    value: string | React.ReactNode;
    ratio: number;
    hideOnMobile?: boolean | undefined;
  }[];
  content: React.ReactNode[][] | React.ReactNode[];
  textSize?: string;
  onRowsClick?: (() => void)[];
  removeHeader?: boolean;
  rowHeight?: string;
}

const Table = (props: Props) => {
  const { isMobile } = useScreenSize();

  return (
    <div className={styles.container} style={{ fontSize: props.textSize }}>
      <div className={styles.title}>
        <Text
          font="proto_mono"
          size="lg"
          opacity={!isMobile ? 0.7 : 1}
          className={isMobile ? styles.tableTitle : undefined}
        >
          {props.title}
        </Text>
        {props.secondary}
      </div>
      <div
        className={styles.table}
        style={{
          gridTemplateRows: !props.removeHeader
            ? !isMobile
              ? "50px 1fr"
              : "40px 1fr"
            : "20px 1fr",
        }}
      >
        {!props.removeHeader ? (
          <div
            className={styles.header}
            style={{
              gridTemplateColumns: props.headers
                .map((header) => {
                  if (isMobile && header.hideOnMobile) {
                    return "";
                  }
                  return `${header.ratio}fr`;
                })
                .join(" "),
            }}
          >
            {props.headers.map((header, index) => {
              return (
                <Text
                  style={{
                    display: isMobile && header.hideOnMobile ? "none" : "flex",
                  }}
                  key={index}
                  className={styles.cell}
                  font={props.headerFont}
                >
                  {header.value}
                </Text>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              borderBottom: "1px solid var(--border-stroke-color)",
              height: "20px",
            }}
          ></div>
        )}
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
                      const ratio =
                        isMobile && header.hideOnMobile ? 0 : header.ratio;
                      return `${ratio}fr`;
                    })
                    .join(" "),
                  cursor: props.onRowsClick ? "pointer" : undefined,
                  height: props.rowHeight ? props.rowHeight : "80px",
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
