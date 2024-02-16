"use client";
import { useState, useEffect } from "react";

type TimeFormat = "h m s";

function getTimeLeft(endTimestamp: bigint): bigint {
  const timeLeft = endTimestamp - BigInt(Date.now());
  if (timeLeft < 0) {
    return 0n;
  }
  return timeLeft;
}

const day = BigInt(1000 * 60 * 60 * 24);
const hour = BigInt(1000 * 60 * 60);
const minute = BigInt(1000 * 60);
const second = BigInt(1000);

const Countdown = ({
  endTimestamp,
  timeFormat,
}: {
  endTimestamp: bigint;
  timeFormat?: TimeFormat;
}) => {
  const [timeLeft, setTimeLeft] = useState<bigint>(getTimeLeft(endTimestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endTimestamp));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTimestamp]);

  const days = timeLeft / day;
  const hours = (timeLeft % day) / hour;
  const minutes = (timeLeft % hour) / minute;
  const seconds = (timeLeft % minute) / second;

  return (
    <>
      {formatTime(
        days.toString(),
        hours.toString(),
        minutes.toString(),
        seconds.toString(),
        timeFormat
      )}
    </>
  );
};

function formatTime(
  days: string,
  hours: string,
  minutes: string,
  seconds: string,
  timeFormat?: TimeFormat
) {
  switch (timeFormat) {
    case "h m s":
      return `${hours}h ${minutes}m ${seconds}s`;
    default:
      return `${days} Days : ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds`;
  }
}

export default Countdown;
