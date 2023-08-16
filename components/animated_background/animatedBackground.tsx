import React from "react";
import styles from "./anim_bg.module.scss";

const AnimatedBackground = () => {
  return (
    <div className={styles.container}>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.moving}></div>
      <div className={styles.sample}></div>

      {/* <hr className={styles.line} style={{ transform: "rotate(0deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(165deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(142deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(114deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(-83deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(-165deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(-142deg)" }}></hr>
      <hr className={styles.line} style={{ transform: "rotate(-114deg)" }}></hr> */}
    </div>
  );
};

export default AnimatedBackground;
