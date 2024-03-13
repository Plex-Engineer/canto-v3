import Container from "@/components/container/container";
import { BridgeTxHistory } from "@/hooks/bridge/useBridgeHistory";
import styles from "./inProgress.module.scss";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";

interface BridgeHistoryProps {
  txList: BridgeTxHistory[];
}
const BridgeHistory = ({ txList }: BridgeHistoryProps) => {
  return (
    <Container height="468px" padding="lg" style={{ overflowY: "auto" }}>
      {txList.map((tx) => (
        <div className={styles.txBox} key={tx.transactionHash}>
          <div className={styles.txImg}>
            <Icon
              icon={{
                size: {
                  height: 24,
                  width: 24,
                },
                url: tx.token.icon,
              }}
            />
          </div>
          <Spacer width="14px" />
          <Container width="100%">
            <Container direction="row">
              <Container width="80%">
                <Text size="sm" theme="secondary-dark">
                  {`bridge ${tx.direction ?? ""}`}
                </Text>
                <Text size="md">{tx.formattedAmount}</Text>
              </Container>
              <Container width="50%">
                {tx.link && (
                  <Container direction="column" style={{ textAlign: "right" }}>
                    <a
                      href={tx.link}
                      target="_blank"
                      style={{
                        textDecoration: "underline",
                        right: 0,
                      }}
                    >
                      <Text size="sm">view explorer</Text>
                    </a>

                    {/* {bridgeData.timeLeft !== undefined && (
                      <Text size="sm" theme="secondary-dark">
                        TIME LEFT: {formatSecondsToMinutes(bridgeData.timeLeft)}
                      </Text>
                    )} */}
                    <Spacer height="8px" />
                  </Container>
                )}
              </Container>
            </Container>
            <Spacer height="10px" />
            {/* <div className={styles.progress}>
              <div
                className={
                  loadingPercentage ? styles.progressBar : styles.infinityBar
                }
                style={{
                  width: loadingPercentage ? `${loadingPercentage}%` : "",
                }}
              ></div>
            </div> */}
            <Spacer height="10px" />
          </Container>
        </div>
      ))}
    </Container>
  );
};
export default BridgeHistory;
