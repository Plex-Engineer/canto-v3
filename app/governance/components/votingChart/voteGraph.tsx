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

  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;
  const abstainPercentage =
    totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0;
  const vetoPercentage = totalVotes > 0 ? (vetoVotes / totalVotes) * 100 : 0;

  const yesHeight = (yesPercentage * size) / 150; //150 is to make the bar occupy at max 2/3rd of the total height of the container if an option get 100% votes
  const noHeight = (noPercentage * size) / 150;
  const abstainHeight = (abstainPercentage * size) / 150;
  const vetoHeight = (vetoPercentage * size) / 150;

  //console.log(abstainHeight);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <Text font="proto_mono">Voting Stats</Text>
      </div>
      <div className={styles.graphContainer}>
        <div className={styles.barContainer}>
          {/* <div className={styles.voteInfo}>YES</div> */}
          {yesHeight > 0 && (
            <div
              className={styles.graph}
              style={{
                height: yesHeight,
              }}
            />
          )}

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
          {yesHeight == 0 && (
            <div
              style={{
                height: 200,
              }}
            />
          )}
        </div>
        <div className={styles.barContainer}>
          {noHeight > 0 && (
            <div
              className={styles.graph}
              style={{
                height: noHeight,
              }}
            ></div>
          )}
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
          {noHeight == 0 && (
            <div
              style={{
                height: 200,
              }}
            />
          )}
        </div>
        <div className={styles.barContainer}>
          {vetoHeight > 0 && (
            <div
              className={styles.graph}
              style={{
                height: vetoHeight,
              }}
            ></div>
          )}
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
          {vetoHeight == 0 && (
            <div
              style={{
                height: 200,
              }}
            />
          )}
        </div>
        <div className={styles.barContainer}>
          {abstainHeight > 0 && (
            <div
              className={styles.graph}
              style={{
                height: abstainHeight,
              }}
            ></div>
          )}
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
          {abstainHeight == 0 && (
            <div
              style={{
                height: 200,
              }}
            />
          )}
        </div>
      </div>
      <div className={styles.inforow}>
        <div className={styles.voteOption}>
          <div className={styles.circleContainer}>
            <div
              className={styles.circle}
              style={{ backgroundColor: "green" }}
            />
          </div>
          <div className={styles.option}>
            <Text font="proto_mono" size="xx-sm">
              YES ({yesPercentage.toFixed(1)}%)
            </Text>
          </div>
        </div>
        <div className={styles.voteOption}>
          <div className={styles.circleContainer}>
            <div className={styles.circle} style={{ backgroundColor: "red" }} />
          </div>
          <div className={styles.option}>
            <Text font="proto_mono" size="xx-sm">
              NO ({noPercentage.toFixed(1)}%)
            </Text>
          </div>
        </div>
        <div className={styles.voteOption}>
          <div className={styles.circleContainer}>
            <div
              className={styles.circle}
              style={{ backgroundColor: "purple" }}
            />
          </div>
          <div className={styles.option}>
            <div>
              <Text font="proto_mono" size="xx-sm">
                VETO
              </Text>
            </div>
            <div>
              <Text font="proto_mono" size="xx-sm">
                ({vetoPercentage.toFixed(1)}%)
              </Text>
            </div>
          </div>
        </div>
        <div className={styles.voteOption}>
          <div className={styles.circleContainer}>
            <div
              className={styles.circle}
              style={{ backgroundColor: "yellow" }}
            />
          </div>
          <div className={styles.option}>
            <div>
              <Text font="proto_mono" size="xx-sm">
                ABSTAIN
              </Text>
            </div>
            <div>
              <Text font="proto_mono" size="xx-sm">
                ({abstainPercentage.toFixed(1)}%)
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteBarGraph;
