import React, { useEffect } from "react";
import styles from "./svgComponent.module.scss";
const SVGComponent = () => {
  const ref = React.useRef<any>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const circle = ref.current;
    const offset = {
      x: 0,
      y: 0,
    };
    // move circle svg with mouse when dragged
    const onMouseMove = (e: MouseEvent) => {
      //   convert global mouse position to svg coordinates
      const pt = circle.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        circle.ownerSVGElement.getScreenCTM()?.inverse()
      );

      //   move svg circle
      circle.setAttribute("cx", `${svgP.x - offset.x}`);
      circle.setAttribute("cy", `${svgP.y - offset.y}`);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      const pt = circle.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        circle.ownerSVGElement.getScreenCTM()?.inverse()
      );
      //  offset = mouse position - circle position
      offset.x = svgP.x - Number(circle.getAttribute("cx"));
      offset.y = svgP.y - Number(circle.getAttribute("cy"));
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    circle.addEventListener("mousedown", onMouseDown);
  }, []);
  return (
    <div
      style={{
        backgroundColor: "red",
        width: "400px",
        height: "400px",
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
