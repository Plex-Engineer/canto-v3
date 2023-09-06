import React from "react";
import Text from "../text";
import styles from "./transactions.module.scss";
import Icon from "../icon/icon";
import Container from "../container/container";
import Spacer from "../layout/spacer";
import { TransactionWithStatus } from "@/config/interfaces/transactions";
import Button from "../button/button";

interface TxItemProps {
  tx: TransactionWithStatus;
  idx: number;
  onRetry: () => void;
}
const TxItem = (props: TxItemProps) => {
  const [isRevealing, setIsRevealing] = React.useState(false);
  return (
    <div
      className={styles.txBox}
      onClick={() => {
        setIsRevealing((prev) => !prev);
      }}
    >
      <div className={styles.txImg}>
        {props.tx.status === "NONE" ? (
          <Text font="proto_mono" opacity={0.5}>
            {props.idx}
          </Text>
        ) : (
          <Icon
            icon={{
              url:
                props.tx.status === "SUCCESS"
                  ? "check.svg"
                  : props.tx.status === "ERROR"
                  ? "close.svg"
                  : props.tx.status === "SIGNING"
                  ? "loader.svg"
                  : "canto.svg",
              size: 24,
            }}
          />
        )}
      </div>
      <Spacer width="14px" />
      <Container width="100%">
        <Container
          width="100%"
          center={{
            horizontal: true,
            vertical: false,
          }}
        >
          <Text size="sm">{props.tx.tx.description.title}</Text>
        </Container>
        <div
          className={styles.collapsable}
          style={{
            maxHeight: isRevealing ? "120px" : "0px",
            width: "100%",
          }}
        >
          <Text size="sm" theme="secondary-dark">
            {props.tx.tx.description.description}
          </Text>
          {props.tx.txLink && (
            <Container direction="row" gap={"auto"}>
              {props.tx.txLink && (
                <a
                  href={props.tx.txLink}
                  style={{
                    textDecoration: "underline",
                  }}
                >
                  <Text size="sm">view link</Text>
                </a>
              )}
              {props.tx.hash && (
                <Text size="sm">#{props.tx.hash.slice(0, 6) + "..."}</Text>
              )}
            </Container>
          )}
        </div>
        {props.tx.status === "ERROR" && (
          <Button onClick={props.onRetry}>RETRY</Button>
        )}
        {props.tx.timestamp && (
          <>timestamp: {new Date(props.tx.timestamp).toLocaleString()}</>
        )}
      </Container>
    </div>
  );
};

export default TxItem;
