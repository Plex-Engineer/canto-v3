import { useEffect, useState } from "react";
import Text from "../text";
import styles from "./loadingText.module.scss";

interface LoadingTextProps {
  text: string;
}
export function LoadingTextAnim({ text }: LoadingTextProps) {
  const [value, setValue] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      if (value === `${text}...`) {
        setValue(text);
      } else {
        setValue(value + ".");
      }
    }, 200);
    return () => clearInterval(interval);
  });
  return (
    <Text font="proto_mono" size="x-sm" className={styles.blink}>
      {value}
    </Text>
  );
}
