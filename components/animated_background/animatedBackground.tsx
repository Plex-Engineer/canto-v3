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
          "--direction": props.direction == "in" ? "normal" : "reverse",
          "--anim-time": props.time + "s",
          "--init-size": props.initSize,
        } as React.CSSProperties
      }
    >
      <svg
        width="1896"
        height="1896"
        viewBox="0 0 1896 1896"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_277_2357)">
          <circle cx="948" cy="948" r="3" fill="white" />
          <mask
            id="mask0_277_2357"
            // style="mask-type:alpha"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1896"
            height="1896"
          >
            <rect
              width="1896"
              height="1896"
              fill="url(#paint0_radial_277_2357)"
            />
          </mask>
          <g mask="url(#mask0_277_2357)">
            <path
              d="M1535 -1073L363.452 2968.37"
              stroke="white"
              stroke-width="1.67751"
            />
            <path
              d="M363 -1073L1534.55 2968.37"
              stroke="white"
              stroke-width="1.67751"
            />
            <path
              d="M-954 -596L2851.65 2490.54"
              stroke="white"
              stroke-width="1.67751"
            />
            <path
              d="M2852 -596L-953.655 2490.54"
              stroke="white"
              stroke-width="1.67751"
            />
            <path
              d="M-2221 246L4118.8 1649.55"
              stroke="white"
              stroke-width="1.67751"
            />
            <path
              d="M-2220 1650L4119.8 246.446"
              stroke="white"
              stroke-width="1.67751"
            />
          </g>
        </g>
        <defs>
          <radialGradient
            id="paint0_radial_277_2357"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(948 948) rotate(-180) scale(1114.62 1152.54)"
          >
            <stop stop-color="white" stop-opacity="0" />
            <stop
              offset="0.208333"
              stop-color="white"
              stop-opacity="0.123773"
            />
            <stop
              offset="0.557292"
              stop-color="white"
              stop-opacity="0.551823"
            />
            <stop offset="0.640625" stop-color="white" stop-opacity="0.44795" />
            <stop offset="1" stop-color="white" stop-opacity="0" />
          </radialGradient>
          <clipPath id="clip0_277_2357">
            <rect width="1896" height="1896" fill="white" />
          </clipPath>
        </defs>
      </svg>

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
