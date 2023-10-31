import React, { useEffect } from "react";
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

const size = {
  height: 114,
  width: 200,
};

const SVGLiquidityGraph = ({
  currentPrice,
  setPrice,
  minPrice,
  maxPrice,
  points,
  axis,
}: Props) => {
  // sliders and state for slider positions (state for position allows for faster rerendering)
  const leftLine = React.useRef<any>(null);
  const [leftPosition, setLeftPosition] = React.useState<number>(
    convertValueToGraphValue(Number(minPrice), axis.x, size.width)
  );
  const rightLine = React.useRef<any>(null);
  const [rightPosition, setRightPosition] = React.useState<number>(
    convertValueToGraphValue(Number(maxPrice), axis.x, size.width)
  );
  // variable to keep track of if the mouse is down
  const [mouseDown, setMouseDown] = React.useState<boolean>(false);

  // initialize slider drags
  React.useEffect(() => {
    if (!leftLine.current) return;
    if (!rightLine.current) return;

    groupDrag(leftLine.current, -5, true);
    groupDrag(rightLine.current, 5, false);
  }, []);

  // will set the slider positions based on drag
  function moveRangeLine(svgPoint: number, isLeftLine: boolean) {
    // don't do anything if refs don't exist
    if (!leftLine.current) return;
    if (!rightLine.current) return;
    // can't use state to get positions, since this function is used in event listeners
    function getTranslateX(element: any) {
      const style = window.getComputedStyle(element);
      const matrix = new WebKitCSSMatrix(style.transform);
      return matrix.m41;
    }
    // don't let sliders cross
    if (isLeftLine && svgPoint >= getTranslateX(rightLine.current)) return;
    if (!isLeftLine && svgPoint <= getTranslateX(leftLine.current)) return;
    // set correct line position
    if (isLeftLine) setLeftPosition(svgPoint);
    else setRightPosition(svgPoint);
  }

  function groupDrag(group: any, offsetX: number, isMinLine: boolean) {
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
      // set positions of line
      const newPoint = svgP.x - offsetX;
      moveRangeLine(newPoint, isMinLine);
    };

    // remove event listeners when mouse is up
    const onMouseUp = () => {
      setMouseDown(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    // add event listeners when mouse is down
    const onMouseDown = () => {
      setMouseDown(true);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    // add event listener for mouse down
    group.addEventListener("mousedown", onMouseDown);
  }

  const paths = () => {
    return convertPointsToSvgPath(axis, points, size, {
      minX: convertGraphValueToValue(leftPosition, axis.x, size.width),
      maxX: convertGraphValueToValue(rightPosition, axis.x, size.width),
    });
  };

  ///
  /// USE EFFECTS FOR STATE CHANGES
  ///

  // called to update the sliders from parent price change
  function syncSlidersFromParent() {
    const svgMin = convertValueToGraphValue(
      Number(minPrice),
      axis.x,
      size.width
    );
    moveRangeLine(svgMin, true);
    const svgMax = convertValueToGraphValue(
      Number(maxPrice),
      axis.x,
      size.width
    );
    moveRangeLine(svgMax, false);
  }
  // useEffect for setting the slider positions when the price or zoom changes from the parent
  React.useEffect(() => {
    // only sync if mouse is up (don't want to override user dragging)
    !mouseDown && syncSlidersFromParent();
  }, [minPrice, maxPrice, axis.x.min, axis.x.max]);

  // called to update the price in the parent (only on drag)
  function syncPriceInParent() {
    setPrice({
      min: convertGraphValueToValue(leftPosition, axis.x, size.width).toFixed(
        4
      ),
      max: convertGraphValueToValue(rightPosition, axis.x, size.width).toFixed(
        4
      ),
    });
  }
  // useEffect for syncing the prices on slider drag
  React.useEffect(() => {
    // only sync price if mouse is down
    mouseDown && syncPriceInParent();
  }, [leftPosition, rightPosition]);

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
            points={paths().mainPath}
            stroke="black"
            fill="#999"
            strokeWidth="1"
            width={"2"}
          />
          <polyline
            points={paths().filledPath}
            stroke="black"
            fill="#08ff14"
            opacity={1}
            strokeWidth="1"
          />
          <rect
            x={leftPosition}
            y={-20}
            width={rightPosition - leftPosition}
            height="140"
            fill="#06FC9933"
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
                {convertGraphValueToValue(
                  leftPosition,
                  axis.x,
                  size.width
                ).toFixed(4)}
              </text>
            </g>
          </g>
          {/* current price line */}
          <line
            x1={convertValueToGraphValue(
              Number(currentPrice),
              axis.x,
              size.width
            )}
            y1="-40"
            x2={convertValueToGraphValue(
              Number(currentPrice),
              axis.x,
              size.width
            )}
            y2="120"
            stroke="black"
            strokeWidth="1"
            strokeDasharray={"2,2"}
          />
          {/* max range slider */}
          <g transform={`translate(${rightPosition},20)`} ref={rightLine}>
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
                {convertGraphValueToValue(
                  rightPosition,
                  axis.x,
                  size.width
                ).toFixed(4)}
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

export default SVGLiquidityGraph;
