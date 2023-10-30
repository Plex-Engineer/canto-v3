import React from "react";
import styles from "./svgComponent.module.scss";

type Point = { x: number; y: number };
type Axis = { min: number; max: number };
interface Props {
  currentPrice: string;
  setPrice: (prices: { min?: string; max?: string }) => void;
  minPrice: string;
  maxPrice: string;

  points: Point[];
  // axis range
  axis: {
    x: Axis;
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
    moveRangeLine(leftLine.current, svgMin, 0, true);
    const svgMax = convertValueToGraphValue(
      Number(props.maxPrice),
      props.axis.x,
      size.width
    );
    moveRangeLine(rightLine.current, svgMax, 0, false);
  }, [props.minPrice, props.maxPrice]);

  const sliderPositions = () => {
    function getTranslateX(element: any) {
      var style = window.getComputedStyle(element);
      var matrix = new WebKitCSSMatrix(style.transform);
      //   console.log("translateX: ", matrix.m41);
      return matrix.m41;
    }
    // make sure lines exist
    const emptyPosition = { xMin: 0, xMax: 0 };
    if (!leftLine.current) return emptyPosition;
    if (!rightLine.current) return emptyPosition;

    const xMin = getTranslateX(leftLine.current);
    const xMax = getTranslateX(rightLine.current);
    return { xMin, xMax };
  };

  function setPrice() {
    const { xMin, xMax } = sliderPositions();
    props.setPrice({
      min: convertGraphValueToValue(xMin, props.axis.x, size.width).toFixed(4),
      max: convertGraphValueToValue(xMax, props.axis.x, size.width).toFixed(4),
    });
  }

  function moveRangeLine(
    group: any,
    svgPoint: number,
    offsetX: number,
    isMinLine: boolean
  ) {
    const { xMin, xMax } = sliderPositions();
    const newPoint = svgPoint - offsetX;
    // don't let sliders cross
    if (isMinLine && newPoint >= xMax) return;
    if (!isMinLine && newPoint <= xMin) return;
    group.setAttribute("transform", `translate(${newPoint},20)`);
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
      moveRangeLine(group, svgP.x, offsetX, isMinLine);
      setPrice();
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

  const RectangleComponent = () => {
    const { xMin, xMax } = sliderPositions();
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

  const paths = convertPointsToSvgPath(props.axis, props.points, size, {
    minX: Number(props.minPrice),
    maxX: Number(props.maxPrice),
  });

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
            points={paths.mainPath}
            stroke="black"
            fill="#999"
            strokeWidth="1"
            width={"2"}
          />
          <polyline
            points={paths.filledPath}
            stroke="black"
            fill="#08ff14"
            opacity={1}
            strokeWidth="2"
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
            <rect
              width="8"
              height="20"
              fill="green"
              x="-8.5"
              y="-30"
              style={{ cursor: "pointer" }}
            />
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
            <rect
              width="8"
              height="20"
              fill="green"
              x=".5"
              y="-30"
              style={{ cursor: "pointer" }}
            />

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
  axis: Axis,
  axisLength: number
): number {
  return ((value - axis.min) / (axis.max - axis.min)) * axisLength;
}
function convertGraphValueToValue(
  graphValue: number,
  axis: Axis,
  axisLength: number
): number {
  return (graphValue / axisLength) * (axis.max - axis.min) + axis.min;
}
function convertPointsToSvgPath(
  axis: { x: Axis; y?: Axis },
  points: Point[],
  svgSize: { width: number; height: number },
  fillRange?: { minX: number; maxX: number }
): { mainPath: string; filledPath: string } {
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
  if (pointsWithinAxis.length === 0) return { mainPath: "", filledPath: "" };

  // find the max y value within the axis (create range for y)
  const yMax = Math.max(...pointsWithinAxis.map((point) => point.y));
  const yAxis = { min: 0, max: yMax };

  // initialize path strings
  let mainPath = "";
  let filledPath = "";

  // will keep track of if we are inside the filled range
  let inFillRange = false;
  let preFirstFillPoint = pointsWithinAxis[0];
  let postFirstFillPoint = pointsWithinAxis[pointsWithinAxis.length - 1];
  let preLastFillPoint = pointsWithinAxis[0];
  let postLastFillPoint = pointsWithinAxis[pointsWithinAxis.length - 1];

  // make svg point for each point within x-axis
  pointsWithinAxis.forEach((point, index) => {
    // get correct graph value for x and y to go into svg graph
    const x = convertValueToGraphValue(point.x, axis.x, svgSize.width);
    const y = convertValueToGraphValue(point.y, yAxis, svgSize.height);

    // invert y to get graph flipped
    mainPath += `${x},${svgSize.height - y} `;

    // check if inside filled range
    if (fillRange && point.x >= fillRange.minX && point.x <= fillRange.maxX) {
      // check if this is the first point in the filled range
      if (!inFillRange) {
        inFillRange = true;
        // get point before and after first filled point
        preFirstFillPoint = pointsWithinAxis[index - 1] ?? pointsWithinAxis[0];
        postFirstFillPoint = pointsWithinAxis[index];
      }
      filledPath += `${x},${svgSize.height - y} `;
    } else if (inFillRange) {
      // we were in the filled range, but now we are not
      inFillRange = false;
      // get point before and after last filled point
      preLastFillPoint = pointsWithinAxis[index - 1] ?? pointsWithinAxis[0];
      postLastFillPoint = pointsWithinAxis[index];
    }
  });

  // create endpoints for main path
  const preFirstPoint =
    firstIndex > 0 ? sortedPoints[firstIndex - 1] : undefined;
  const postLastPoint = lastIndex > 0 ? sortedPoints[lastIndex] : undefined;

  const mainEndpoints = createPolyLineEndpoints(
    preFirstPoint,
    pointsWithinAxis[0],
    pointsWithinAxis[pointsWithinAxis.length - 1],
    postLastPoint,
    { x: axis.x, y: yAxis },
    svgSize
  );
  // add endpoints to main path
  mainPath = mainEndpoints.prefix + mainPath + mainEndpoints.suffix;

  // create endpoints for filled path (if path exists)
  if (fillRange && filledPath !== "") {
    // get y value of point at min fill range
    const graphFillMinY =
      svgSize.height -
      convertValueToGraphValue(
        estimateYFromX(fillRange.minX, preFirstFillPoint, postFirstFillPoint),
        yAxis,
        svgSize.height
      );
    const graphFillMinX = convertValueToGraphValue(
      fillRange.minX,
      axis.x,
      svgSize.width
    );
    filledPath =
      `${graphFillMinX},${svgSize.height} ${graphFillMinX},${graphFillMinY} ` +
      filledPath;

    // get y value at max fill range
    const graphFillMaxY =
      svgSize.height -
      convertValueToGraphValue(
        estimateYFromX(fillRange.maxX, preLastFillPoint, postLastFillPoint),
        yAxis,
        svgSize.height
      );
    const graphFillMaxX = convertValueToGraphValue(
      fillRange.maxX,
      axis.x,
      svgSize.width
    );

    filledPath =
      filledPath +
      `${graphFillMaxX},${graphFillMaxY} ${graphFillMaxX},${svgSize.height} `;
  }

  return { mainPath, filledPath };
}

function createPolyLineEndpoints(
  preFirstPoint: Point | undefined,
  firstPoint: Point,
  lastPoint: Point,
  postLastPoint: Point | undefined,
  axis: { x: Axis; y: Axis },
  svgSize: { width: number; height: number }
): {
  prefix: string;
  suffix: string;
} {
  let prefix = "";
  let suffix = "";
  // add first points to graph (before axis or zero)
  if (!preFirstPoint) {
    // no points before axis, create vertical line staight down to zero and to the beginning of the graph
    prefix += `0,${svgSize.height}, ${convertValueToGraphValue(
      firstPoint.x,
      axis.x,
      svgSize.width
    )},${svgSize.height} `;
  } else {
    // there is a point before the axis, connect this point to the beginning of the graph, but from zero
    prefix += `0,${svgSize.height}, 0,${
      svgSize.height -
      convertValueToGraphValue(
        estimateYFromX(axis.x.min, preFirstPoint, firstPoint),
        axis.y,
        svgSize.height
      )
    } `;
  }

  // add last points to graph (after axis or zero)
  if (!postLastPoint) {
    // no points after axis, create vertical line staight down to zero and to the end of the graph
    suffix += `${convertValueToGraphValue(
      lastPoint.x,
      axis.x,
      svgSize.width
    )}, ${svgSize.height}, ${svgSize.width},${svgSize.height} `;
  } else {
    // there is a point after the axis, connect this point to the end of the graph, but from zero
    suffix += `${svgSize.width},${
      svgSize.height -
      convertValueToGraphValue(
        estimateYFromX(axis.x.max, lastPoint, postLastPoint),
        axis.y,
        svgSize.height
      )
    } ${svgSize.width},${svgSize.height} `;
  }
  return { prefix, suffix };
}

// function for getting y value of point on line given x value and two points
function estimateYFromX(
  x: number,
  pointBefore: Point,
  pointAfter: Point
): number {
  // check before division by zero
  if (pointAfter.x === pointBefore.x) return pointBefore.y;
  const slope = (pointAfter.y - pointBefore.y) / (pointAfter.x - pointBefore.x);
  return pointBefore.y + slope * (x - pointBefore.x);
}

export default SVGComponent;
