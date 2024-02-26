import React from "react";
import styles from "./voteGraph.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting";
import Container from "@/components/container/container";

interface VoteBarGraphProps {
  yes: number;
  no: number;
  abstain: number;
  veto: number;
  size: number;
  isMobile?: boolean;
}

interface BarProps {
  amount: number;
  totalVotes: number;
  size: number;
  isMobile?: boolean;
}

const Bar = ({ amount, totalVotes, size, isMobile }: BarProps) => {
  const height =
    ((totalVotes > 0 ? (amount / totalVotes) * 100 : 0) * size) / 150; //150 is to make the bar occupy at max 2/3rd of the total height of the container if an option get 100% votes

  return (
    <div className={styles.barContainer}>
      {/* <div className={styles.voteInfo}>YES</div> */}
      {height > 0 && (
        <div
          className={styles.bar}
          style={{
            height: height,
            width: isMobile ? "24px" : "32px",
          }}
        />
      )}

      <div className={styles.amountInfo}>
        <div>
          <Text size="x-sm">
            {formatBalance(amount.toString(), 0, { short: true })}{" "}
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
      {height == 0 && (
        <div
          style={{
            height: size * 0.7,
          }}
        />
      )}
    </div>
  );
};
const VoteInfo = ({
  color,
  percentage,
  name,
}: {
  color: string;
  percentage: number;
  name: string;
}) => {
  return (
    <div className={styles.voteOption}>
      <div className={styles.circleContainer}>
        <div className={styles.circle} style={{ backgroundColor: color }} />
      </div>
      <div className={styles.option}>
        <Text font="proto_mono" size="xx-sm">
          {name} ({percentage.toFixed(1)}%)
        </Text>
      </div>
    </div>
  );
};
export const VoteBarGraph = ({
  yes,
  no,
  abstain,
  veto,
  size,
  isMobile,
}: VoteBarGraphProps) => {
  const totalVotes = yes + no + abstain + veto;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <Text font="proto_mono">Voting Stats</Text>
      </div>
      <div className={styles.graphContainer}>
        <Bar
          amount={yes}
          totalVotes={totalVotes}
          size={size}
          isMobile={isMobile}
        />
        <Bar
          amount={no}
          totalVotes={totalVotes}
          size={size}
          isMobile={isMobile}
        />
        <Bar
          amount={veto}
          totalVotes={totalVotes}
          size={size}
          isMobile={isMobile}
        />
        <Bar
          amount={abstain}
          totalVotes={totalVotes}
          size={size}
          isMobile={isMobile}
        />
      </div>
      <div className={styles.inforow}>
        <VoteInfo
          percentage={totalVotes > 0 ? (yes / totalVotes) * 100 : 0}
          name="YES"
          color="#0DFE17"
        />
        <VoteInfo
          percentage={totalVotes > 0 ? (no / totalVotes) * 100 : 0}
          name="NO"
          color="#EF4444"
        />
        <VoteInfo
          percentage={totalVotes > 0 ? (veto / totalVotes) * 100 : 0}
          name="VETO"
          color="#9747FF"
        />
        <VoteInfo
          percentage={totalVotes > 0 ? (abstain / totalVotes) * 100 : 0}
          name="ABSTAIN"
          color="#EAD42A"
        />
      </div>
    </div>
  );
};

export const VoteBarSecondary = ({
  height,
  maxHeight,
  index,
}: {
  height: number;
  maxHeight: number;
  index: number;
}) => {
  const getColor = (index: number): string => {
    switch (index) {
      case 0:
        return "#12D481";
      case 1:
        return "#EF4444";
      case 2:
        return "#A22ED8";
      case 3:
        return "#F5E98A";
      default:
        return "";
    }
  };
  return (
    <Container
      direction="column"
      style={{
        justifyContent: "flex-end",
      }}
    >
      <Container
        width="8px"
        height={height.toString() + "px"}
        backgroundColor={height == maxHeight ? getColor(index) : ""}
        className={styles.bar}
      >
        <div></div>
      </Container>
    </Container>
  );
};

export const VoteGraphBox = ({
  yes,
  no,
  abstain,
  veto,
  isMobile,
}: VoteBarGraphProps) => {
  const totalVotes = yes + no + abstain + veto;

  const yesPercentage = totalVotes > 0 ? (yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (no / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstain / totalVotes) * 100 : 0;
  const vetoPercentage = totalVotes > 0 ? (veto / totalVotes) * 100 : 0;

  const getVoteOption = (index: number): string => {
    switch (index) {
      case 0:
        return "YES";
      case 1:
        return "NO";
      case 2:
        return "VETO";
      case 3:
        return "ABSTAIN";
      default:
        return "";
    }
  };

  const maxPercentage = Math.max(
    ...[yesPercentage, noPercentage, abstainPercentage, vetoPercentage]
  );
  const maxIndex = [
    yesPercentage,
    noPercentage,
    abstainPercentage,
    vetoPercentage,
  ].indexOf(maxPercentage);

  return totalVotes > 0 ? (
    <div>
      <Container direction="row">
        <Container height="30px" className={styles.displayVotes}>
          <Container className={styles.barGraph} direction="row" width="44px">
            <VoteBarSecondary
              height={yesPercentage * 0.3}
              maxHeight={maxPercentage * 0.3}
              index={0}
            />
            <VoteBarSecondary
              height={noPercentage * 0.3}
              maxHeight={maxPercentage * 0.3}
              index={1}
            />
            <VoteBarSecondary
              height={vetoPercentage * 0.3}
              maxHeight={maxPercentage * 0.3}
              index={2}
            />
            <VoteBarSecondary
              height={abstainPercentage * 0.3}
              maxHeight={maxPercentage * 0.3}
              index={3}
            />
          </Container>
        </Container>
        <Container
          direction="row"
          style={{
            alignItems: "flex-start",
            height: "30px",
            padding: "4px 0 4px 0",
          }}
        >
          <Container height="100%" style={{ paddingRight: "4px" }}>
            <Text font="proto_mono" size="x-sm">
              {maxPercentage.toFixed(1)}%{" "}
            </Text>
          </Container>
          <Container
            height="100%"
            style={{ paddingRight: "4px", alignItems: "center" }}
          >
            <Text opacity={0.4} font="rm_mono" size="x-sm">
              {" "}
              {getVoteOption(maxIndex)}
            </Text>
          </Container>
        </Container>
      </Container>
    </div>
  ) : (
    <div>
      <Container
        center={{ vertical: true }}
        direction="row"
        className={styles.proposalStatus}
      >
        <div className={styles.circleContainer}>
          <div
            className={styles.circleBlink}
            style={{
              backgroundColor: "#01BD09",
            }}
          />
        </div>
        <Container>
          <Text font="rm_mono" className={styles.tableData} size="x-sm">
            {"ACTIVE"}
          </Text>
        </Container>
      </Container>
    </div>
  );
};
