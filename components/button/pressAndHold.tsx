import React from "react";
import Button, { ButtonProps } from "./button";

interface ButtonHoldProps extends ButtonProps {
  onHold: () => void;
  interval?: number;
}
const ButtonHold = (props: ButtonHoldProps) => {
  const timerRef = React.useRef<NodeJS.Timer | null>(null);
  React.useEffect(() => {
    return stopTimer();
  }, []);
  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      props.onHold();
    }, props.interval ?? 100);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  return (
    <Button
      {...props}
      buttonProps={{
        onMouseDown: startTimer,
        onMouseUp: stopTimer,
        onMouseLeave: stopTimer,
      }}
    />
  );
};

export default ButtonHold;
