import React from "react";
import { ITransaction } from "./TxUnused";
import Text from "../text";
import styles from "./transactions.module.scss";
import Icon from "../icon/icon";
import Container from "../container/container";
import Spacer from "../layout/spacer";

const TxItem = (props: ITransaction) => {
  const [isRevealing, setIsRevealing] = React.useState(false);
  return (
    <div
      className={styles.txBox}
      onClick={() => {
        setIsRevealing((prev) => !prev);
      }}
    >
      <div className={styles.txImg}>
        {props.status === "pending" ? (
          <Text font="proto_mono" opacity={0.5}>
            {props.idx}
          </Text>
        ) : (
          <Icon
            icon={{
              url:
                props.status === "success"
                  ? "check.svg"
                  : props.status === "failed"
                  ? "close.svg"
                  : props.status === "loading"
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
          <Text size="sm">{props.title}</Text>
        </Container>

        <div
          className={styles.collapsable}
          style={{
            maxHeight: isRevealing ? "120px" : "0px",
            width: "100%",
          }}
        >
          <Text size="sm" theme="secondary-dark">
            {props.description}
          </Text>
          {props.status === "success" && (
            <Container direction="row" gap={"auto"}>
              {props.link && (
                <a
                  href={props.link}
                  style={{
                    textDecoration: "underline",
                  }}
                >
                  <Text size="sm">view link</Text>
                </a>
              )}
              {props.hash && <Text size="sm">#{props.hash}</Text>}
            </Container>
          )}
        </div>
      </Container>
    </div>
  );
};

export default TxItem;
