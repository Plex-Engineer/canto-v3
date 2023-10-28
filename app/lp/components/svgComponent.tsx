import React from "react";
import styles from "./svgComponent.module.scss";

interface Props {
  currentPrice: string;
  setPrice: (prices: { min?: string; max?: string }) => void;
  minPrice: string;
  maxPrice: string;

  points: { x: number; y: number }[];
  // axis range
  axis: {
    x: {
      min: number;
      max: number;
    };
  };
}
const SVGComponent = (props: Props) => {
  // get svg sizing from props or default
  const size = {
    height: 114,
    width: 200,
  };

  const leftLine = React.useRef<any>(null);
  const rightLine = React.useRef<any>(null);
  // const selectedRangeBox = React.useRef<any>(null);

  // const [selectedRange, setSelectedRange] = React.useState<{
  //   min: number;
  //   max: number;
  //   range: number;
  // }>({
  //   max: 0,
  //   min: 0,
  //   range: 0,
  // });

  React.useEffect(() => {
    if (!leftLine.current) return;
    if (!rightLine.current) return;

    groupDrag(leftLine.current, -5, true);
    groupDrag(rightLine.current, 5, false);
  }, []);

  React.useEffect(() => {
    if (!leftLine.current) return;
    if (!rightLine.current) return;
    // get svgPoint from prices and set lines
    const svgMin = convertValueToGraphValue(
      Number(props.minPrice),
      props.axis.x,
      size.width
    );
    moveRangeLine(leftLine.current, svgMin, 0);
    const svgMax = convertValueToGraphValue(
      Number(props.maxPrice),
      props.axis.x,
      size.width
    );
    moveRangeLine(rightLine.current, svgMax, 0);
  }, [props.minPrice, props.maxPrice]);

  function setPrice() {
    function getTranslateX(element: any) {
      var style = window.getComputedStyle(element);
      var matrix = new WebKitCSSMatrix(style.transform);
      //   console.log("translateX: ", matrix.m41);
      return matrix.m41;
    }
    const xMin = getTranslateX(leftLine.current);
    const xMax = getTranslateX(rightLine.current);

    props.setPrice({
      min: convertGraphValueToValue(xMin, props.axis.x, size.width).toFixed(4),
      max: convertGraphValueToValue(xMax, props.axis.x, size.width).toFixed(4),
    });
  }

  function moveRangeLine(group: any, svgPoint: number, offsetX: number) {
    group.setAttribute("transform", `translate(${svgPoint - offsetX},20)`);
    // moveSelectedRangeBox();
  }

  function groupDrag(group: any, offsetX: number, isMinLine: boolean) {
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
      moveRangeLine(group, svgP.x, offsetX);
      setPrice();

      // //   move svg group
      // group.setAttribute(
      //   "transform",
      //   // `translateX(${svgP.x - offset.x})`
      //   `translate(${svgP.x - offsetX},20)`
      // );
      // moveSelectedRangeBox();
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      // const pt = group.ownerSVGElement?.createSVGPoint();
      // if (!pt) return;
      // pt.x = e.clientX;
      // pt.y = e.clientY;
      // const svgP = pt.matrixTransform(
      //   group.ownerSVGElement.getScreenCTM()?.inverse()
      // );
      // //  offset = mouse position - group translate position
      // offset.x = svgP.x - Number(group.getAttribute("translateX"));

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    group.addEventListener("mousedown", onMouseDown);
  }

  // function moveSelectedRangeBox() {
  //   if (!selectedRangeBox.current) return;
  //   if (!leftLine.current) return;
  //   if (!rightLine.current) return;

  //   function getTranslateX(element: any) {
  //     var style = window.getComputedStyle(element);
  //     var matrix = new WebKitCSSMatrix(style.transform);
  //     //   console.log("translateX: ", matrix.m41);
  //     return matrix.m41;
  //   }

  //   const xMin = getTranslateX(leftLine.current);
  //   const xMax = getTranslateX(rightLine.current);

  //   setSelectedRange({
  //     min: xMin,
  //     max: xMax,
  //     range: xMax - xMin,
  //   });
  // }

  const RectangleComponent = () => {
    // if (!selectedRangeBox.current) return null;
    if (!leftLine.current) return null;
    if (!rightLine.current) return null;
    function getTranslateX(element: any) {
      var style = window.getComputedStyle(element);
      var matrix = new WebKitCSSMatrix(style.transform);
      //   console.log("translateX: ", matrix.m41);
      return matrix.m41;
    }
    const xMin = getTranslateX(leftLine.current);
    const xMax = getTranslateX(rightLine.current);

    return (
      <rect
        x={xMin}
        y={-20}
        width={xMax - xMin}
        height="140"
        fill="#06FC9933"
      />
    );
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <svg viewBox="0 0 200 100" className={styles.svg}>
          {/* graph points */}
          <polyline
            points={convertPointsToSvgPath(props.axis, props.points, size)}
            stroke="black"
            fill="none"
            strokeWidth="1"
            className={styles.polyline}
          />
          <RectangleComponent />
          {/* <rect
            x={selectedRange.min}
            y={-20}
            width={selectedRange.range}
            height="140"
            fill="#06FC9933"
            ref={selectedRangeBox}
          /> */}
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
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {props.minPrice}
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
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {props.maxPrice}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
};

///
/// Helper functions for graph
///

function convertValueToGraphValue(
  value: number,
  axis: { min: number; max: number },
  axisLength: number
): number {
  return ((value - axis.min) / (axis.max - axis.min)) * axisLength;
}
function convertGraphValueToValue(
  graphValue: number,
  axis: { min: number; max: number },
  axisLength: number
): number {
  return (graphValue / axisLength) * (axis.max - axis.min) + axis.min;
}
function convertPointsToSvgPath(
  axis: { x: { min: number; max: number } },
  points: { x: number; y: number }[],
  svgSize: { width: number; height: number }
): string {
  // sort the points and remove negative y values
  const sortedPoints = points
    .sort((a, b) => a.x - b.x)
    .map((point) => ({ x: point.x, y: point.y < 0 ? 0 : point.y }));
  // find the points within the axis as well as the points directly before and after axis
  const firstIndex = sortedPoints.findIndex((point) => point.x >= axis.x.min);
  const lastIndex = sortedPoints.findIndex((point) => point.x >= axis.x.max);
  const pointsWithinAxis = sortedPoints.slice(
    firstIndex,
    lastIndex !== -1 ? lastIndex : undefined
  );

  // if no points within axis, return empty string before doing any operations
  if (pointsWithinAxis.length === 0) return "";

  // find the min and max y values
  const yMin = Math.min(...pointsWithinAxis.map((point) => point.y));
  const yMax = Math.max(...pointsWithinAxis.map((point) => point.y));

  // initialize path string
  let path = "";

  // add first points to graph (before axis or zero)
  if (firstIndex === 0) {
    // no points before axis, create vertical line staight down to zero and to the beginning of the graph
    path += `0,${svgSize.height}, ${convertValueToGraphValue(
      pointsWithinAxis[0].x,
      axis.x,
      svgSize.width
    )},${svgSize.height} `;
  } else if (firstIndex > 0) {
    // there is a point before the axis, connect this point to the beginning of the graph, but from zero
    const slope =
      (pointsWithinAxis[0].y - sortedPoints[firstIndex - 1].y) /
      (pointsWithinAxis[0].x - sortedPoints[firstIndex - 1].x);
    const pointAtAxis =
      pointsWithinAxis[0].y - slope * (pointsWithinAxis[0].x - axis.x.min);
    path += `0,${svgSize.height}, 0,${convertValueToGraphValue(
      pointAtAxis,
      axis.x,
      svgSize.width
    )} `;
  }

  for (const point of pointsWithinAxis) {
    // get correct graph value for x and y to go into svg graph
    const x = convertValueToGraphValue(point.x, axis.x, svgSize.width);
    const y = convertValueToGraphValue(
      point.y,
      {
        min: yMin,
        max: yMax,
      },
      svgSize.height
    );

    // invert y to get graph flipped
    path += `${x},${svgSize.height - y} `;
  }

  // add last points to graph (after axis or zero)
  if (lastIndex === -1) {
    // no points after axis, create vertical line staight down to zero and to the end of the graph
    path += `${convertValueToGraphValue(
      pointsWithinAxis[pointsWithinAxis.length - 1].x,
      axis.x,
      svgSize.width
    )}, ${svgSize.height}, ${svgSize.width},${svgSize.height} `;
  } else {
    // there is a point after the axis, connect this point to the end of the graph, but from zero
    const slope =
      (sortedPoints[lastIndex].y -
        pointsWithinAxis[pointsWithinAxis.length - 1].y) /
      (sortedPoints[lastIndex].x -
        pointsWithinAxis[pointsWithinAxis.length - 1].x);
    const pointAtAxis =
      pointsWithinAxis[pointsWithinAxis.length - 1].y +
      slope * (axis.x.max - pointsWithinAxis[pointsWithinAxis.length - 1].x);
    path += `${svgSize.width},${convertValueToGraphValue(
      pointAtAxis,
      axis.x,
      svgSize.width
    )} ${svgSize.width},${svgSize.height} `;
  }

  return path;
}

export default SVGComponent;
