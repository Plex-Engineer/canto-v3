import React, { useEffect } from "react";
import styles from "./svgComponent.module.scss";
const SVGComponent = () => {
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const circle = ref.current;

    // move circle svg with mouse when dragged only on x axis delta
    const onMouseMove = (e: MouseEvent) => {
      //   convert global mouse position to svg coordinates
      const pt = circle.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        circle.ownerSVGElement.getScreenCTM()?.inverse()
      );

      //add offset to circle
      circle.setAttribute("cx", String(svgP.x));
      circle.setAttribute("cy", String(svgP.y));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = () => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    circle.addEventListener("mousedown", onMouseDown);
  }, []);
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "300px",
        height: "150px",
      }}
    >
      <svg viewBox="0 0 100 100">
        <rect
          x="10"
          y="10"
          width="20%"
          height="20%"
          fill="pink"
          stroke="blue"
        />
        <circle
          cx="40"
          cy="25"
          r="16%"
          stroke="#222"
          className={styles.circle}
          ref={ref}
        />
        <polygon
          points="100,10 150,190 160,110"
          style={{
            fill: "lime",
            stroke: "purple",
            strokeWidth: 1,
          }}
        />
      </svg>
    </div>
  );
};

export default SVGComponent;
