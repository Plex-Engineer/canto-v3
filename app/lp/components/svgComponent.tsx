import React, { useEffect } from "react";
import styles from "./svgComponent.module.scss";
import Text from "@/components/text";

interface Props {
  points: { x: string; y: number }[];
}
const SVGComponent = ({ points }: Props) => {
  const leftLine = React.useRef<any>(null);
  const rightLine = React.useRef<any>(null);
  const selectedRangeBox = React.useRef<any>(null);

  const [selectedRange, setSelectedRange] = React.useState<{
    x: number;
    y: number;
    size: number;
  }>({
    y: 0,
    x: 0,
    size: 0,
  });

  function convertToPath(
    points: {
      x: string;
      y: number;
    }[]
  ) {
    // ex path="20,20 40,25 60,40"
    // clamp y values between 0 and 100
    // use x values length to determine how many points to show

    let path = "";
    const xLength = points.length;
    const xSpace = 100 / xLength;

    // convert y values to 0-100% range
    const yValues = points.map((point) => point.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;

    for (let i = 0; i < xLength; i++) {
      const y = points[i].y;

      let yClamped = 100 - ((yMax - y) / yRange) * 100;
      // invert yClamped value
      yClamped = 100 - yClamped;

      path += `${xSpace * (i + 1)},${yClamped} `;
    }
    // convert these percentages to svg coordinates

    const svgWidth = 200;
    const svgHeight = 114;
    const svgPath = path
      .split(" ")
      .map((point) => {
        const [x, y] = point.split(",");
        return `${(svgWidth * Number(x)) / 100},${
          (svgHeight * Number(y)) / 100
        }`;
      })
      .join(" ");
    return svgPath;
  }

  React.useEffect(() => {
    if (!leftLine.current) return;
    if (!rightLine.current) return;

    groupDrag(leftLine.current, -5);
    groupDrag(rightLine.current, 5);
  }, []);

  function groupDrag(group: any, offsetX: number) {
    const offset: any = {
      x: 0,
      y: 0,
    };

    // move group svg with mouse when dragged
    const onMouseMove = (e: MouseEvent) => {
      //   convert global mouse position to svg coordinates
      const pt = group.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        group.ownerSVGElement.getScreenCTM()?.inverse()
      );

      //   move svg group
      group.setAttribute(
        "transform",
        // `translateX(${svgP.x - offset.x})`
        `translate(${svgP.x - offsetX},20)`
      );
      moveSelectedRangeBox();
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      const pt = group.ownerSVGElement?.createSVGPoint();
      if (!pt) return;
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(
        group.ownerSVGElement.getScreenCTM()?.inverse()
      );
      //  offset = mouse position - group translate position
      offset.x = svgP.x - Number(group.getAttribute("translateX"));

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    group.addEventListener("mousedown", onMouseDown);
  }

  function moveSelectedRangeBox() {
    if (!selectedRangeBox.current) return;
    if (!leftLine.current) return;
    if (!rightLine.current) return;

    function getTranslateX(element: any) {
      var style = window.getComputedStyle(element);
      var matrix = new WebKitCSSMatrix(style.transform);
      //   console.log("translateX: ", matrix.m41);
      return matrix.m41;
    }

    const x = getTranslateX(leftLine.current);
    const y = 0;
    const size = getTranslateX(rightLine.current) - x;

    setSelectedRange({
      x,
      y,
      size,
    });
  }

  //   function lineDrag(line: any) {
  //     const offset = {
  //       x: 0,
  //       y: 0,
  //     };
  //     // move line svg with mouse when dragged on x axis
  //     const onMouseMove = (e: MouseEvent) => {
  //       //   convert global mouse position to svg coordinates
  //       const pt = line.ownerSVGElement?.createSVGPoint();
  //       if (!pt) return;
  //       pt.x = e.clientX;
  //       pt.y = e.clientY;
  //       const svgP = pt.matrixTransform(
  //         line.ownerSVGElement.getScreenCTM()?.inverse()
  //       );

  //       //   move svg line
  //       line.setAttribute("x1", `${svgP.x - offset.x}`);
  //       line.setAttribute("x2", `${svgP.x - offset.x}`);
  //     };

  //     const onMouseUp = () => {
  //       document.removeEventListener("mousemove", onMouseMove);
  //       document.removeEventListener("mouseup", onMouseUp);
  //     };

  //     const onMouseDown = (e: MouseEvent) => {
  //       const pt = line.ownerSVGElement?.createSVGPoint();
  //       if (!pt) return;
  //       pt.x = e.clientX;
  //       pt.y = e.clientY;
  //       const svgP = pt.matrixTransform(
  //         line.ownerSVGElement.getScreenCTM()?.inverse()
  //       );
  //       //  offset = mouse position - line position
  //       offset.x = svgP.x - Number(line.getAttribute("x1"));
  //       //   offset.y = svgP.y - Number(line.getAttribute("cy"));
  //       document.addEventListener("mousemove", onMouseMove);
  //       document.addEventListener("mouseup", onMouseUp);
  //     };

  //     line.addEventListener("mousedown", onMouseDown);
  //   }

  //   function circleDrag() {
  //     if (!ref.current) return;

  //     const circle = ref.current;
  //     const offset = {
  //       x: 0,
  //       y: 0,
  //     };
  //     // move circle svg with mouse when dragged
  //     const onMouseMove = (e: MouseEvent) => {
  //       //   convert global mouse position to svg coordinates
  //       const pt = circle.ownerSVGElement?.createSVGPoint();
  //       if (!pt) return;
  //       pt.x = e.clientX;
  //       pt.y = e.clientY;
  //       const svgP = pt.matrixTransform(
  //         circle.ownerSVGElement.getScreenCTM()?.inverse()
  //       );

  //       //   move svg circle
  //       circle.setAttribute("cx", `${svgP.x - offset.x}`);
  //       circle.setAttribute("cy", `${svgP.y - offset.y}`);
  //     };

  //     const onMouseUp = () => {
  //       document.removeEventListener("mousemove", onMouseMove);
  //       document.removeEventListener("mouseup", onMouseUp);
  //     };

  //     const onMouseDown = (e: MouseEvent) => {
  //       const pt = circle.ownerSVGElement?.createSVGPoint();
  //       if (!pt) return;
  //       pt.x = e.clientX;
  //       pt.y = e.clientY;
  //       const svgP = pt.matrixTransform(
  //         circle.ownerSVGElement.getScreenCTM()?.inverse()
  //       );
  //       //  offset = mouse position - circle position
  //       offset.x = svgP.x - Number(circle.getAttribute("cx"));
  //       //   offset.y = svgP.y - Number(circle.getAttribute("cy"));
  //       document.addEventListener("mousemove", onMouseMove);
  //       document.addEventListener("mouseup", onMouseUp);
  //     };

  //     circle.addEventListener("mousedown", onMouseDown);
  //   }

  return (
    <>
      <div
        style={{
          position: "absolute",
          transform: `translate(170px,-30px)`,
        }}
      >
        <Text size="sm">
          Selected Range : {selectedRange.size.toFixed(0) + "%"}
        </Text>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <svg viewBox="0 0 200 100" className={styles.svg}>
          <polyline
            points={convertToPath(points)}
            stroke="black"
            fill="none"
            strokeWidth="1"
            className={styles.polyline}
          />
          <view id="two" viewBox="100 0 100 100" />

          {/* <rect x="40" y="-14" width="40" height="128" fill="#06FC9933" /> */}
          <rect
            x={selectedRange.x}
            y={selectedRange.y}
            width={selectedRange.size}
            height="128"
            fill="#06FC9933"
            ref={selectedRangeBox}
          />

          <g transform="translate(40,20)" ref={leftLine}>
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="120"
              stroke="black"
              ref={rightLine}
            />
            <rect width="8" height="20" fill="green" x="-8.5" y="-30" />
            <g>
              <rect
                x={-40}
                y={-30}
                width={30}
                height={14}
                fill="#22222239"
                rx={1}
              />
              <text
                x={-40 + 30 / 2}
                y={-30 + 14 / 2}
                dominant-baseline="middle"
                text-anchor="middle"
              >
                {selectedRange.x.toFixed(0) + "%"}
              </text>
            </g>
          </g>
          <g transform="translate(80,20)" ref={rightLine}>
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="120"
              stroke="black"
              ref={rightLine}
            />
            <rect width="8" height="20" fill="green" x=".5" y="-30" />

            <g>
              <rect
                x={10}
                y={-30}
                width={30}
                height={14}
                fill="#22222239"
                rx={1}
              />
              <text
                x={10 + 30 / 2}
                y={-30 + 14 / 2}
                dominant-baseline="middle"
                text-anchor="middle"
              >
                {(selectedRange.size + selectedRange.x).toFixed(0) + "%"}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
};

export default SVGComponent;
