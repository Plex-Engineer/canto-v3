import React from "react";
import styles from "./inProgress.module.scss";
import {
  dateToMomentsAgo,
  formatError,
  formatSecondsToMinutes,
} from "@/utils/formatting";
import { useQuery } from "react-query";
import { getBridgeStatus } from "@/transactions/bridge";
import { BridgeStatus, TransactionWithStatus } from "@/transactions/interfaces";
import Text from "@/components/text";
import StatusIcon from "@/components/icon/statusIcon";
import Spacer from "@/components/layout/spacer";
import Container from "@/components/container/container";

interface TxItemProps {
  tx: TransactionWithStatus;
  idx: number;
  setBridgeStatus: (status: BridgeStatus) => void;
}
const InProgressTxItem = (props: TxItemProps) => {
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
          console.error(error);
          return;
        }
        props.setBridgeStatus(data);
      }
    },
    {
      enabled:
        props.tx.tx.bridge !== undefined &&
        props.tx.tx.bridge.lastStatus !== "SUCCESS",
      refetchInterval: 10000,
    }
  );

  return (
    <div className={styles.txBox}>
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
          <Text size="sm" theme="secondary-dark">
            {props.tx.tx.description.title}
          </Text>
        </Container>
        <div
          className={styles.collapsable}
          style={{
            maxHeight: "500px",
            width: "100%",
          }}
        >
          <Text size="md">{props.tx.tx.description.description}</Text>
          <Spacer height="8px" />
          {props.tx.txLink && (
            <Container direction="row" gap="auto">
              {props.tx.hash && (
                <Text size="sm">
                  #
                  {props.tx.hash.slice(0, 4) +
                    "..." +
                    props.tx.hash.slice(-5, -1)}
                </Text>
                // </PopUp>
              )}
              {props.tx.txLink && (
                <a
                  href={props.tx.txLink}
                  target="_blank"
                  style={{
                    textDecoration: "underline",
                  }}
                >
                  <Text size="sm">view explorer</Text>
                </a>
              )}
            </Container>
          )}
          {props.tx.error && (
            <Text size="sm" style={{ color: "var(--extra-failure-color,red)" }}>
              {formatError(props.tx.error)}
            </Text>
          )}
        </div>
        <Container direction="row" gap={"auto"}>
          {props.tx.timestamp && (
            <Text size="sm" theme="secondary-dark">
              {dateToMomentsAgo(props.tx.timestamp)}
            </Text>
          )}
          {props.tx.tx.bridge && props.tx.tx.bridge.lastStatus !== "NONE" && (
            <Container>
              <Text size="sm" theme="secondary-dark">
                Bridge Status - {props.tx.tx.bridge.lastStatus.toLowerCase()}
              </Text>
              {props.tx.tx.bridge.timeLeft !== undefined && (
                <Text size="sm" theme="secondary-dark">
                  TIME LEFT:{" "}
                  {formatSecondsToMinutes(props.tx.tx.bridge.timeLeft)}
                </Text>
              )}
            </Container>
          )}
        </Container>
      </Container>
    </div>
  );
};

export default InProgressTxItem;
