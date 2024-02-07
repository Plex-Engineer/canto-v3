import React from "react";
import styles from "./voteGraph.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting";

interface VoteBarGraphProps {
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  vetoVotes: number;
  size: number;
}

const VoteBarGraph = ({
  yesVotes,
  noVotes,
  abstainVotes,
  vetoVotes,
  size,
}: VoteBarGraphProps) => {
  const totalVotes = yesVotes + noVotes + abstainVotes + vetoVotes;

  const yesPercentage = (yesVotes / totalVotes) * 60;
  const noPercentage = (noVotes / totalVotes) * 60;
  const abstainPercentage = (abstainVotes / totalVotes) * 60;
  const vetoPercentage = (vetoVotes / totalVotes) * 60;

  const yesHeight = (yesPercentage * size) / 100;
  const noHeight = (noPercentage * size) / 100;
  const abstainHeight = (abstainPercentage * size) / 100;
  const vetoHeight = (vetoPercentage * size) / 100;

  //console.log(abstainHeight);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <Text font="proto_mono">Voting Stats</Text>
      </div>
      <div className={styles.graphContainer}>
        <div className={styles.barContainer}>
          <div className={styles.voteInfo}>YES</div>
          <div
            className={styles.graph}
            style={{
              height: yesHeight,
            }}
          ></div>
          <div className={styles.amountInfo}>
            <div>
              <Text size="x-sm">
                {formatBalance(yesVotes.toString(), 0, { short: true })}{" "}
              </Text>
            </div>
            <div className={styles.icon}>
              <Icon
                icon={{
                  url: "/tokens/canto.svg",
                  size: {
                    width: 12,
                    height: 12,
                  },
                }}
                themed
              />
            </div>
          </div>
        </div>
        <div className={styles.barContainer}>
          <div
            className={styles.graph}
            style={{
              height: noHeight,
            }}
          ></div>
          <div className={styles.amountInfo}>
            <div>
              <Text size="x-sm">
                {formatBalance(noVotes.toString(), 0, { short: true })}{" "}
              </Text>
            </div>
            <div className={styles.icon}>
              <Icon
                icon={{
                  url: "/tokens/canto.svg",
                  size: {
                    width: 12,
                    height: 12,
                  },
                }}
                themed
              />
            </div>
          </div>
        </div>
        <div className={styles.barContainer}>
          <div
            className={styles.graph}
            style={{
              height: abstainHeight,
            }}
          ></div>
          <div className={styles.amountInfo}>
            <div>
              <Text size="x-sm">
                {formatBalance(abstainVotes.toString(), 0, { short: true })}{" "}
              </Text>
            </div>
            <div className={styles.icon}>
              <Icon
                icon={{
                  url: "/tokens/canto.svg",
                  size: {
                    width: 12,
                    height: 12,
                  },
                }}
                themed
              />
            </div>
          </div>
        </div>
        <div className={styles.barContainer}>
          <div
            className={styles.graph}
            style={{
              height: vetoHeight,
            }}
          ></div>
          <div className={styles.amountInfo}>
            <div>
              <Text size="x-sm">
                {formatBalance(vetoVotes.toString(), 0, { short: true })}{" "}
              </Text>
            </div>
            <div className={styles.icon}>
              <Icon
                icon={{
                  url: "/tokens/canto.svg",
                  size: {
                    width: 12,
                    height: 12,
                  },
                }}
                themed
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteBarGraph;
