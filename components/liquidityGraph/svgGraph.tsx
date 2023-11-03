import React from "react";
import styles from "./svgComponent.module.scss";
import Container from "../container/container";
import Text from "../text";

type Point = { x: number; y: number };
type Axis = { min: number; max: number };
interface Props {
  points: Point[];
  // axis range
  axis: {
    x: Axis;
  };
  // for shading region under curve
  currentXValue: number;
  minXValue: number;
  maxXValue: number;
  // for setting outside values
  setValues?: (values: { min?: number; max?: number }) => void;
}

const size = {
  height: 114,
  width: 200,
};

const SVGLiquidityGraph = ({
  points,
  axis,
  currentXValue,
  minXValue,
  maxXValue,
  setValues,
}: Props) => {
  // sliders and state for slider positions (state for position allows for faster rerendering)
  const leftLine = React.useRef<any>(null);
  const [leftPosition, setLeftPosition] = React.useState<number>(
    convertValueToGraphValue(minXValue, axis.x, size.width)
  );
  const rightLine = React.useRef<any>(null);
  const [rightPosition, setRightPosition] = React.useState<number>(
    convertValueToGraphValue(maxXValue, axis.x, size.width)
  );
  const rectangleRef = React.useRef<any>(null);
  // variable to keep track of if the mouse is down
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);

  // initialize slider drags
  React.useEffect(() => {
    if (!leftLine.current) return;
    if (!rightLine.current) return;
    sliderDrag(leftLine.current, -5, true);
    sliderDrag(rightLine.current, 5, false);
    if (!rectangleRef.current) return;
    boxDrag(rectangleRef.current);
  }, []);

  function getMouseSvgPoint(
    element: any,
    e: MouseEvent
  ): { x: number; y: number } | undefined {
    // convert global mouse position to svg coordinates
    const pt = element.ownerSVGElement?.createSVGPoint();
    if (!pt) return;
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(
      element.ownerSVGElement.getScreenCTM()?.inverse()
    );
    return svgP;
  }
  function getElementSvgPoint(element: any): number {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
  }

  function sliderDrag(element: any, offsetX: number, isMinLine: boolean) {
    onElementDrag(element, {
      onDown: () => setMouseDown(true),
      onUp: () => setMouseDown(false),
      onMove: (e: MouseEvent) => {
        // get svg point
        const svgP = getMouseSvgPoint(element, e);
        if (!svgP) return;
        // set positions of line
        const newPoint = svgP.x - offsetX;
        moveRangeLine(newPoint, isMinLine);
      },
    });
  }

  function boxDrag(element: any) {
    // track where the user first clicked on the box and where the sliders currently are
    let startingClickPoint: number;
    let startingLeftPosition: number;
    let startingRightPosition: number;
    onElementDrag(element, {
      onDown: (e) => {
        setMouseDown(true);
        const svgP = getMouseSvgPoint(element, e);
        if (!svgP) return;
        startingClickPoint = svgP.x;
        startingLeftPosition = getElementSvgPoint(leftLine.current);
        startingRightPosition = getElementSvgPoint(rightLine.current);
      },
      onUp: () => setMouseDown(false),
      onMove: (e: MouseEvent) => {
        // see how far the mouse has moved from the starting point
        const svgP = getMouseSvgPoint(element, e);
        if (!svgP) return;
        const offset = svgP.x - startingClickPoint;

        // must move the range lines by the same amount
        moveRangeLine(startingLeftPosition + offset, true);
        moveRangeLine(startingRightPosition + offset, false);
      },
    });
  }

  // will set the slider positions based on drag
  function moveRangeLine(svgPoint: number, isLeftLine: boolean) {
    // don't do anything if refs don't exist
    if (!leftLine.current) return;
    if (!rightLine.current) return;
    // can't use state to get positions, since this function is used in event listeners

    // don't let sliders cross
    if (isLeftLine && svgPoint >= getElementSvgPoint(rightLine.current)) return;
    if (!isLeftLine && svgPoint <= getElementSvgPoint(leftLine.current)) return;
    // set correct line position
    if (isLeftLine) setLeftPosition(svgPoint);
    else setRightPosition(svgPoint);
  }

  ///
  /// USE EFFECTS FOR STATE CHANGES
  ///

  // called to update the sliders from parent min/max changes change
  function syncSlidersFromParent() {
    const svgMin = convertValueToGraphValue(minXValue, axis.x, size.width);
    moveRangeLine(svgMin, true);
    const svgMax = convertValueToGraphValue(maxXValue, axis.x, size.width);
    moveRangeLine(svgMax, false);
  }
  // useEffect for setting the slider positions when the min/max or zoom changes from the parent
  React.useEffect(() => {
    // only sync if mouse is up (don't want to override user dragging)
    !mouseDown && syncSlidersFromParent();
  }, [minXValue, maxXValue, axis.x.min, axis.x.max]);

  // called to update the values in the parent (only on drag)
  function syncValuesInParent() {
    setValues &&
      setValues({
        min: convertGraphValueToValue(leftPosition, axis.x, size.width),
        max: convertGraphValueToValue(rightPosition, axis.x, size.width),
      });
  }
  // useEffect for syncing the values on slider drag
  React.useEffect(() => {
    // only sync values if mouse is down
    mouseDown && syncValuesInParent();
  }, [leftPosition, rightPosition]);

  ///
  /// PATHS ON GRAPH
  ///
  const paths = () => {
    return convertPointsToSvgPath(axis, points, size, {
      minX: convertGraphValueToValue(leftPosition, axis.x, size.width),
      maxX: convertGraphValueToValue(rightPosition, axis.x, size.width),
    });
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
            className={styles.graph}
            points={paths().mainPath}
            stroke="black"
            strokeWidth="0"
            width={"2"}
          />
          <polyline
            className={styles["graph-filled"]}
            points={paths().filledPath}
            stroke="black"
            opacity={1}
            strokeWidth="0"
          />
          <rect
            x={leftPosition}
            y={-20}
            width={rightPosition - leftPosition}
            height="140"
            ref={rectangleRef}
            className={styles["graph-overlay"]}
          />
          {/* min range slider */}
          <g transform={`translate(${leftPosition},20)`} ref={leftLine}>
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="120"
              stroke="black"
              ref={leftLine}
            />

            <svg
              width="8"
              height="22"
              viewBox="0 0 15 39"
              x="-8.5"
              y="-34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.handle}
            >
              <path
                d="M0 4.00001C0 1.79087 1.79086 0 4 0H15V38.8235H4C1.79086 38.8235 0 37.0327 0 34.8235V4.00001Z"
                fill="#C1C1C1"
              />
              <path
                d="M5 11.9117L5 26.9117"
                stroke="#111111"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M10 11.9117L10 26.9117"
                stroke="#111111"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {/* <g>
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
                className={styles.text}
              >
                {convertGraphValueToValue(
                  leftPosition,
                  axis.x,
                  size.width
                ).toFixed(4)}
              </text>
            </g> */}
          </g>
          {/* current price line */}
          <line
            className={styles["current-price-line"]}
            x1={convertValueToGraphValue(currentXValue, axis.x, size.width)}
            y1="-40"
            x2={convertValueToGraphValue(currentXValue, axis.x, size.width)}
            y2="120"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray={"2,2"}
          />
          {/* max range slider */}
          <g transform={`translate(${rightPosition},20)`} ref={rightLine}>
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="120"
              strokeWidth={"1"}
              stroke="black"
              ref={rightLine}
            />

            <svg
              width="8"
              height="22"
              viewBox="0 0 15 39"
              x=".5"
              y="-34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.handle}
            >
              <path
                d="M15 4.00001C15 1.79087 13.2091 0 11 0H0V38.8235H11C13.2091 38.8235 15 37.0327 15 34.8235V4.00001Z"
                fill="#C1C1C1"
              />
              <path
                d="M10 11.9117L10 26.9117"
                stroke="#111111"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M5 11.9117L5 26.9117"
                stroke="#111111"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>

            {/* <g>
              <rect
                x={10}
                y={-30}
                width={3}
                height={14}
                fill="#64646439"
                rx={1}
              />

              <text
                x={10 + 30 / 2}
                y={-30 + 14 / 2}
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={10}
                className={styles.text}
              >
                {convertGraphValueToValue(
                  rightPosition,
                  axis.x,
                  size.width
                ).toFixed(4)}
              </text>
            </g> */}
          </g>

          {/* x axis plotting */}
        </svg>
        <svg viewBox="0 0 200 10" className={styles.svgAxis}>
          <g>
            <text
              x={0}
              y={0}
              dominantBaseline="middle"
              textAnchor="start"
              fontSize={10}
              className={styles.text}
            >
              {axis.x.min.toFixed(4)}
            </text>
            <text
              x={size.width / 4}
              y={0}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={10}
              className={styles.text}
            >
              {convertGraphValueToValue(
                size.width / 4,
                axis.x,
                size.width
              ).toFixed(4)}
            </text>
            <text
              x={size.width / 2}
              y={0}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={10}
              className={styles.text}
            >
              {convertGraphValueToValue(
                size.width / 2,
                axis.x,
                size.width
              ).toFixed(4)}
            </text>
            <text
              x={(size.width * 3) / 4}
              y={0}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={10}
              className={styles.text}
            >
              {convertGraphValueToValue(
                (size.width * 3) / 4,
                axis.x,
                size.width
              ).toFixed(4)}
            </text>
            <text
              x={size.width}
              y={0}
              dominantBaseline="middle"
              textAnchor="end"
              fontSize={10}
              className={styles.text}
            >
              {axis.x.max.toFixed(4)}
            </text>
          </g>
        </svg>
      </div>
    </>
  );
};

///
/// Helper functions for graph
///

function onElementDrag(
  element: any,
  callbacks: {
    onMove: (e: MouseEvent) => void;
    onUp?: (e: MouseEvent) => void;
    onDown?: (e: MouseEvent) => void;
  }
) {
  // callback for when mouse is moved
  const onMouseMove = (e: MouseEvent) => callbacks.onMove(e);

  const onMouseUp = (e: MouseEvent) => {
    // callback for when mouse is up
    callbacks.onUp && callbacks.onUp(e);
    // remove event listeners when mouse is up
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
  const onMouseDown = (e: MouseEvent) => {
    // callback for when mouse is down
    callbacks.onDown && callbacks.onDown(e);
    // add event listeners when mouse is down
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  // add event listener for mouse down
  element.addEventListener("mousedown", onMouseDown);
}

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

export default SVGLiquidityGraph;
