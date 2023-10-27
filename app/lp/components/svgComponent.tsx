import React, { useEffect } from "react";
import styles from "./svgComponent.module.scss";
import Text from "@/components/text";

interface Props {
  points: { x: string; y: number }[];
  axis: {
    x: {
      min: number;
      max: number;
    };
  };
  currentPrice: string;
  min: {
    value: string;
    onChange: (value: string) => void;
  };
  max: {
    value: string;
    onChange: (value: string) => void;
  };
}
const SVGComponent = ({ points, axis }: Props) => {
  const leftLine = React.useRef<any>(null);
  const rightLine = React.useRef<any>(null);
  const selectedRangeBox = React.useRef<any>(null);

  const [selectedRange, setSelectedRange] = React.useState<{
    min: number;
    max: number;
    range: number;
  }>({
    max: 0,
    min: 0,
    range: 0,
  });
  // converts x,y points to svg path
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

  //   converts x,y points with range to svg path
  function convertToPathWithRange(
    range: { min: number; max: number },
    points: { x: string; y: number }[]
  ) {
    // the x is price would have the range 0 to any dollar value
    // the x will provide points for the graph and the range will provide the min and max values for the range slider

    let path = "";

    // plot x values on range provided
    const xValues = points.map((point) => Number(point.x));
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xRange = xMax - xMin;

    // convert y values to 0-100% range
    const yValues = points.map((point) => point.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin;

    for (let i = 0; i < xValues.length; i++) {
      const x = xValues[i];
      const y = points[i].y;

      let xClamped = ((x - xMin) / xRange) * 100;
      let yClamped = 100 - ((yMax - y) / yRange) * 100;
      // invert yClamped value
      yClamped = 100 - yClamped;

      path += `${xClamped},${yClamped} `;
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
    const size = getTranslateX(rightLine.current) - x;

    setSelectedRange({
      min: x,
      max: x + size,
      range: size,
    });
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          transform: `translate(170px,-30px)`,
        }}
      >
        <Text size="sm">
          Selected Range : {selectedRange.range.toFixed(0) + "%"}
        </Text>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <svg viewBox="0 0 200 100" className={styles.svg}>
          {/* graph points */}
          <polyline
            points={convertToPathWithRange(
              {
                min: axis.x.min,
                max: axis.x.max,
              },
              [
                {
                  x: axis.x.min.toString(),
                  y: 0,
                },
                {
                  x: points[0].x,
                  y: 0,
                },
                ...points,
                {
                  x: points[points.length - 1].x,
                  y: 0,
                },
                {
                  x: axis.x.max.toString(),
                  y: 0,
                },
              ]
            )}
            stroke="black"
            fill="none"
            strokeWidth="1"
            className={styles.polyline}
          />

          <rect
            x={selectedRange.min}
            y={-20}
            width={selectedRange.range}
            height="140"
            fill="#06FC9933"
            ref={selectedRangeBox}
          />
          {/* min range slider */}
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
                {(
                  (axis.x.max - axis.x.min) * (selectedRange.min / 200) +
                  axis.x.min
                ).toFixed(3)}
              </text>
            </g>
          </g>
          {/* max range slider */}
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
                {(selectedRange.range + selectedRange.min).toFixed(0) + "%"}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
};

export default SVGComponent;
