import React from "react";
import styles from "./anim_bg.module.scss";

interface Props {
  direction: "in" | "out";
  time: number;
  initSize: string;
}

const AnimatedBackground = (props: Props) => {
  return (
    <div
      className={styles.container}
      style={
        {
          "--direction": props.direction == "in" ? "reverse" : "normal",
          "--anim-time": props.time + "s",
          "--init-size": props.initSize,
        } as React.CSSProperties
      }
    >
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>

      {/* <div className={styles.sample}></div> */}
    </div>
  );
};

export default AnimatedBackground;
