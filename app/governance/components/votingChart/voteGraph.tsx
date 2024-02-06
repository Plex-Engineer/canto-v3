import React from "react";

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
  // Calculate the total number of votes
  const totalVotes = yesVotes + noVotes + abstainVotes + vetoVotes;

  // Calculate the percentage of votes for each option
  const yesPercentage = (yesVotes / totalVotes) * 100;
  const noPercentage = (noVotes / totalVotes) * 100;
  const abstainPercentage = (abstainVotes / totalVotes) * 100;
  const vetoPercentage = (vetoVotes / totalVotes) * 100;

  // Calculate the height of each bar based on the percentage of votes
  const yesHeight = (yesPercentage * size) / 100;
  const noHeight = (noPercentage * size) / 100;
  const abstainHeight = (abstainPercentage * size) / 100;
  const vetoHeight = (vetoPercentage * size) / 100;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{ height: yesHeight, backgroundColor: "green", flexGrow: 1 }}
      ></div>
      <div
        style={{ height: noHeight, backgroundColor: "red", flexGrow: 1 }}
      ></div>
      <div
        style={{ height: abstainHeight, backgroundColor: "blue", flexGrow: 1 }}
      ></div>
      <div
        style={{ height: vetoHeight, backgroundColor: "yellow", flexGrow: 1 }}
      ></div>
    </div>
  );
};

export default VoteBarGraph;
