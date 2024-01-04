import React, { useMemo } from "react";
import styles from "./inProgress.module.scss";
import { formatSecondsToMinutes } from "@/utils/formatting";
import { useQuery } from "react-query";
import { getBridgeStatus } from "@/transactions/bridge";
import { BridgeStatus, TransactionWithStatus } from "@/transactions/interfaces";
import Text from "@/components/text";
import StatusIcon from "@/components/icon/statusIcon";
import Spacer from "@/components/layout/spacer";
import Container from "@/components/container/container";

interface TxItemProps {
  tx: TransactionWithStatus;
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

  // get bridge info from tx
  const bridgeData = useMemo(() => props.tx.tx.bridge, [props.tx.tx.bridge]);

  // asumme full bar is 30 minutes
  const loadingPercentage: number | null = useMemo(() => {
    const isComplete = bridgeData?.lastStatus === "SUCCESS";
    if (isComplete) {
      return 100;
    }
    // time left may be null
    if (!bridgeData?.timeLeft) {
      return null;
    }
    // get percent left
    const percentLeft = (bridgeData?.timeLeft / 1800) * 100;
    if (percentLeft >= 100) {
      // show small progress
      return 1;
    }
    return 100 - percentLeft;
  }, [bridgeData?.timeLeft, bridgeData?.lastStatus]);

  // if bridge data is not defined, return null
  if (!bridgeData) {
    return null;
  }

  return (
    <div className={styles.txBox}>
      <div className={styles.txImg}>
        <StatusIcon status={bridgeData.lastStatus} size={24} />
      </div>
      <Spacer width="14px" />
      <Container width="100%">
        <Container direction="row">
          <Container width="80%">
            <Text size="sm" theme="secondary-dark">
              {`bridge ${bridgeData.direction ?? ""}`}
            </Text>
            <Text size="md">{bridgeData.amountFormatted}</Text>
          </Container>
          <Container width="50%">
            {props.tx.txLink && (
              <Container direction="column" style={{ textAlign: "right" }}>
                {props.tx.txLink && (
                  <a
                    href={props.tx.txLink}
                    target="_blank"
                    style={{
                      textDecoration: "underline",
                      right: 0,
                    }}
                  >
                    <Text size="sm">view explorer</Text>
                  </a>
                )}
                {bridgeData.timeLeft !== undefined && (
                  <Text size="sm" theme="secondary-dark">
                    TIME LEFT: {formatSecondsToMinutes(bridgeData.timeLeft)}
                  </Text>
                )}
                <Spacer height="8px" />
              </Container>
            )}
            {/* {props.tx.error && (
              <Text
                size="sm"
                style={{ color: "var(--extra-failure-color,red)" }}
              >
                {formatError(props.tx.error)}
              </Text>
            )} */}
          </Container>
        </Container>
        <Spacer height="10px" />
        <div className={styles.progress}>
          <div
            className={
              loadingPercentage ? styles.progressBar : styles.infinityBar
            }
            style={{ width: loadingPercentage ? `${loadingPercentage}%` : "" }}
          ></div>
        </div>
        <Spacer height="10px" />
      </Container>
    </div>
  );
};

export default InProgressTxItem;
