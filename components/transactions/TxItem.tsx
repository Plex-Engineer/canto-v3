import React from "react";
import Text from "../text";
import styles from "./transactions.module.scss";
import Container from "../container/container";
import Spacer from "../layout/spacer";
import {
  BridgeStatus,
  TransactionWithStatus,
} from "@/config/interfaces/transactions";
import Button from "../button/button";
import { dateToMomentsAgo } from "@/utils/formatting.utils";
import StatusIcon from "../icon/statusIcon";
import { useQuery } from "react-query";
import { getBridgeStatus } from "@/hooks/bridge/transactions/bridgeTxStatus";

interface TxItemProps {
  tx: TransactionWithStatus;
  idx: number;
  onRetry: () => void;
  setBridgeStatus: (status: BridgeStatus) => void;
}
const TxItem = (props: TxItemProps) => {
  const [isRevealing, setIsRevealing] = React.useState(false);
  useQuery(
    "bridge status",
    async () => {
      const bridge = props.tx.tx.bridge;
      if (bridge && props.tx.hash && bridge.lastStatus !== "SUCCESS") {
        const { data, error } = await getBridgeStatus(
          bridge.type,
          props.tx.tx.chainId as number,
          props.tx.hash
        );
        if (error) {
          console.log(error);
          return;
        }
        props.setBridgeStatus(data);
      }
    },
    {
      enabled: props.tx.tx.bridge !== undefined,
      refetchInterval: 10000,
    }
  );

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
          <StatusIcon status={props.tx.status} size={24} />
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
                  {props.tx.hash ? (
                    <Text size="sm">#{props.tx.hash.slice(0, 6) + "..."}</Text>
                  ) : (
                    <Text size="sm">view link</Text>
                  )}
                </a>
              )}
            </Container>
          )}
        </div>

        {props.tx.timestamp && (
          <Text size="sm" theme="secondary-dark">
            {dateToMomentsAgo(props.tx.timestamp)}
          </Text>
        )}
        {props.tx.tx.bridge && props.tx.tx.bridge.lastStatus !== "NONE" && (
          <Text size="sm" theme="secondary-dark">
            BRIDGE STATUS - {props.tx.tx.bridge.lastStatus} Time left:
            {props.tx.tx.bridge.timeLeft}
          </Text>
        )}
      </Container>
      {props.tx.status === "ERROR" && (
        <Button onClick={props.onRetry} color="primary">
          retry
        </Button>
      )}
    </div>
  );
};

export default TxItem;
