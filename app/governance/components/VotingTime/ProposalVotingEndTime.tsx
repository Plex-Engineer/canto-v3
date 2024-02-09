import React, { useState, useEffect } from "react";

interface ProposalVotingEndTimeProps {
  endTime: Date;
}

const ProposalVotingEndTime = ({ endTime }: ProposalVotingEndTimeProps) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  function calculateTimeLeft(endTime: Date) {
    const difference = endTime.getTime() - new Date().getTime();
    let timeLeft: string;

    if (difference > 0) {
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      timeLeft = `${hours}h ${minutes}m ${seconds}s`;
    } else {
      timeLeft = "Voting ended";
    }

    return timeLeft;
  }

  return <div>{timeLeft}</div>;
};

export default ProposalVotingEndTime;
