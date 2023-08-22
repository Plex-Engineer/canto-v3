import React from "react";
import styles from "./boxes_bg.module.scss";

const BoxedBackground = () => {
  const grid = {
    x: 30,
    y: 20,
  };
  return (
    <div className={styles.container}>
      {Array.from({ length: grid.x * grid.y }).map((_, i) => (
        <div
          key={i}
          className={styles.box}
          style={{
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

export default BoxedBackground;
