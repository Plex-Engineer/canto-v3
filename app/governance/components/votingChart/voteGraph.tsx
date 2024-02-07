import React from "react";
import styles from "./voteGraph.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";

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

  const yesPercentage = (yesVotes / totalVotes) * 100;
  const noPercentage = (noVotes / totalVotes) * 100;
  const abstainPercentage = (abstainVotes / totalVotes) * 100;
  const vetoPercentage = (vetoVotes / totalVotes) * 100;

  const yesHeight = (yesPercentage * size) / 100;
  const noHeight = (noPercentage * size) / 100;
  const abstainHeight = (abstainPercentage * size) / 100;
  const vetoHeight = (vetoPercentage * size) / 100;

  return (
    <div
      className={styles.statsContainer}
      style={{
        height: size,
      }}
    >
      <div className={styles.statsHeader}>
        <Text font="proto_mono">Voting Stats</Text>
      </div>
      <div className={styles.graphContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <div className={styles.amountInfo}>YES</div>
          <div
            className={styles.graph}
            style={{
              height: yesHeight,
            }}
          ></div>
          <div className={styles.amountInfo}>
            <div>
              <Text>{yesVotes} </Text>
            </div>
            <div className={styles.icon}>
              <Icon
                icon={{
                  url: "/tokens/canto.svg",
                  size: {
                    width: 14,
                    height: 14,
                  },
                }}
                themed
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <div
            className={styles.graph}
            style={{
              height: noHeight,
            }}
          ></div>
          <div></div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <div
            className={styles.graph}
            style={{
              height: abstainHeight,
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <div
            className={styles.graph}
            style={{
              height: vetoHeight,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VoteBarGraph;
