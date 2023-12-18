import React from "react";
import Text from "../text";
import styles from "./transactions.module.scss";
import Container from "../container/container";
import Spacer from "../layout/spacer";
import {
  dateToMomentsAgo,
  formatError,
  formatSecondsToMinutes,
} from "@/utils/formatting";
import StatusIcon from "../icon/statusIcon";
import { useQuery } from "react-query";
import { getBridgeStatus } from "@/transactions/bridge";
import { BridgeStatus, TransactionWithStatus } from "@/transactions/interfaces";
import Analytics, { AnalyticsTransactionFlowInfo } from "@/provider/analytics";

interface TxItemProps {
  tx: TransactionWithStatus;
  analyticsTxFlowInfo?: AnalyticsTransactionFlowInfo;
  idx: number;
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
      enabled:
        props.tx.tx.bridge !== undefined &&
        props.tx.tx.bridge.lastStatus !== "SUCCESS",
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
            maxHeight: isRevealing ? "500px" : "0px",
            width: "100%",
          }}
        >
          <Text size="sm" theme="secondary-dark">
            {props.tx.tx.description.description}
          </Text>
          <Spacer height="8px" />
          {props.tx.txLink && (
            <Container direction="row" gap="auto">
              {props.tx.hash && (
                // <PopUp width="600px" content={<Text>{props.tx.hash}</Text>}>
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
                  onClick={() => {
                    if (props.analyticsTxFlowInfo) {
                      Analytics.actions.events.transactionFlows.explorerViewed({
                        ...props.analyticsTxFlowInfo,
                        txType: props.tx.tx.feTxType,
                      });
                    }
                  }}
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

export default TxItem;
