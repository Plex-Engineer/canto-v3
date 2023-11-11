import React from "react";
import styles from "./svgComponent.module.scss";
import { GraphZoom } from "./helpers/graphZoom";

type Point = { x: number; y: number };
type Axis = {
  min: number;
  max: number;
};

interface Props {
  title: string;
  points: Point[];
  options?: {
    // default axis
    axis?: {
      x: Axis;
    };
    // boundaries for zooming
    boundaries?: {
      x: Axis;
    };
  };
  // for updating and getting values from parent
  parentOptions?: {
    // current value indicator
    currentXValue: number;
    // for shading region under the curve
    minXValue: number;
    maxXValue: number;
    // set values in parent
    setValues: (values: { min?: number; max?: number }) => void;
  };
}

const defaultParentOptions = {
  currentXValue: 0.5,
  minXValue: 0.25,
  maxXValue: 0.75,
  setValues: (_values: { min?: number; max?: number }) => {},
} as const;

const size = {
  height: 114,
  width: 200,
};

// type for elements on the grapg
type GraphElement = "leftSlider" | "rightSlider" | "box";

const SVGLiquidityGraph = ({
  title,
  points,
  options,
  parentOptions = defaultParentOptions,
}: Props) => {
  // get values from parent options
  const { currentXValue, minXValue, maxXValue, setValues } = parentOptions;
  // state for axis
  const [xAxis, setXAxis] = React.useState<Axis>(
    options?.axis?.x ?? { min: 0, max: 1 }
  );
  // state for slider positions
  const [leftPosition, setLeftPosition] = React.useState<number>(
    convertValueToGraphValue(parentOptions.minXValue, xAxis, size.width)
  );
  const [rightPosition, setRightPosition] = React.useState<number>(
    convertValueToGraphValue(
      parentOptions?.maxXValue ?? 0.75,
      xAxis,
      size.width
    )
  );
  // state for current element being dragged
  const draggingElement = React.useRef<GraphElement | null>(null);
  // state for where the mouse is when first clicking an element
  const firstClickedPosition = React.useRef<number>(0);

  // handle mouse movements for dragging on the graph
  function handleMouseDown(e: any, element: GraphElement) {
    firstClickedPosition.current = getMouseSVGPoint(e)?.x ?? 0;
    draggingElement.current = element;
    document.addEventListener("mousemove", handleMouseMove);
  }
  // default mouse up handler any time mouse is up
  document.addEventListener("mouseup", () => {
    draggingElement.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
  });

  function handleMouseMove(e: MouseEvent) {
    // get the mouse position in svg coordinates
    const svgPoint = getMouseSVGPoint(e);
    if (!svgPoint) return;
    // get offset from first clicked position
    const offset = svgPoint.x - firstClickedPosition.current;
    switch (draggingElement.current) {
      case "leftSlider":
        setLeftPosition(leftPosition + offset);
        break;
      case "rightSlider":
        setRightPosition(rightPosition + offset);
        break;
      case "box":
        setLeftPosition(leftPosition + offset);
        setRightPosition(rightPosition + offset);
        break;
    }
  }

  function getMouseSVGPoint(e: MouseEvent) {
    const getSvg = () => {
      const svgElements = document.querySelectorAll("svg");
      for (const element of svgElements) {
        if (element.id === "svgGraph") return element;
      }
      return null;
    };
    const svg = getSvg();
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return svgPoint;
  }

  ///
  ///  SYNC VALUES FROM PARENT / UPDATE VALUES IN PARENT
  ///

  // set slider positions when parent values change or axis changes
  React.useEffect(() => {
    // only sync if not currently dragging
    if (draggingElement.current) return;
    setLeftPosition(convertValueToGraphValue(minXValue, xAxis, size.width));
    setRightPosition(convertValueToGraphValue(maxXValue, xAxis, size.width));
  }, [minXValue, maxXValue, xAxis]);

  // set parent positions when sliders change
  React.useEffect(() => {
    // only set this when dragging
    if (!draggingElement.current) return;
    setValues({
      min: convertGraphValueToValue(leftPosition, xAxis, size.width),
      max: convertGraphValueToValue(rightPosition, xAxis, size.width),
    });
  }, [leftPosition, rightPosition]);

  ///
  /// HANDLE ZOOMING
  ///
  function zoomIn() {
    setXAxis((prev) => ({
      min: prev.min + 0.0001,
      max: prev.max - 0.0001,
    }));
  }
  function zoomOut() {
    const minBoundary = options?.boundaries?.x.min ?? -Infinity;
    setXAxis((prev) => ({
      min: prev.min - 0.0001 < minBoundary ? minBoundary : prev.min - 0.0001,
      max: prev.max + 0.0001,
    }));
  }
  // change axis when price changes past boundaries
  React.useEffect(() => {
    setXAxis((prev) => {
      let newMin = prev.min;
      let newMax = prev.max;
      if (minXValue < prev.min) {
        newMin = minXValue - 0.001;
      }
      if (maxXValue > prev.max) {
        newMax = maxXValue + 0.001;
      }
      return {
        min: newMin,
        max: newMax,
      };
    });
  }, [minXValue, maxXValue]);

  ///
  /// PATHS ON GRAPH
  ///
  const paths = React.useMemo(() => {
    return convertPointsToSvgPath(xAxis, points, size, {
      minX: convertGraphValueToValue(leftPosition, xAxis, size.width),
      maxX: convertGraphValueToValue(rightPosition, xAxis, size.width),
    });
  }, [xAxis, points, leftPosition, rightPosition]);

  return (
    <>
      <GraphZoom
        title={title}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        reset={() => setXAxis(options?.axis?.x ?? { min: 0, max: 1 })}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
        className={styles.priceRanger}
      >
        <svg viewBox="0 0 200 100" className={styles.svg} id="svgGraph">
          {/* graph points */}
          <polyline
            className={styles.graph}
            points={paths.mainPath}
            stroke="black"
            strokeWidth="0"
            width={"2"}
          />
          <polyline
            className={styles["graph-filled"]}
            points={paths.filledPath}
            stroke="black"
            opacity={1}
            strokeWidth="0"
          />
          <rect
            x={leftPosition}
            y={-20}
            width={rightPosition - leftPosition}
            height="140"
            className={styles["graph-overlay"]}
            onMouseDown={(e) => handleMouseDown(e, "box")}
          />
          {/* min range slider */}
          <g
            transform={`translate(${leftPosition},20)`}
            id="leftSlider"
            onMouseDown={(e) => handleMouseDown(e, "leftSlider")}
          >
            <line x1="0" y1="-40" x2="0" y2="120" stroke="black" />

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
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 11.9117L10 26.9117"
                stroke="#111111"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </g>
          {/* current price line */}
          <line
            className={styles["current-price-line"]}
            x1={convertValueToGraphValue(currentXValue, xAxis, size.width)}
            y1="-40"
            x2={convertValueToGraphValue(currentXValue, xAxis, size.width)}
            y2="120"
            stroke="black"
            strokeWidth=".5"
            strokeDasharray={"2,2"}
          />
          {/* max range slider */}
          <g
            transform={`translate(${rightPosition},20)`}
            id="rightSlider"
            onMouseDown={(e) => handleMouseDown(e, "rightSlider")}
          >
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="120"
              strokeWidth={"1"}
              stroke="black"
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
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 11.9117L5 26.9117"
                stroke="#111111"
                strokeWidth="2"
                strokeLinecap="round"
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
              {xAxis.min.toFixed(4)}
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
                xAxis,
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
                xAxis,
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
                xAxis,
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
              {xAxis.max.toFixed(4)}
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
  xAxis: Axis,
  points: Point[],
  svgSize: { width: number; height: number },
  fillRange?: { minX: number; maxX: number }
): { mainPath: string; filledPath: string } {
  // sort the points and remove negative y values
  const sortedPoints = points
    .sort((a, b) => a.x - b.x)
    .map((point) => ({ x: point.x, y: point.y < 0 ? 0 : point.y }));

  // find the points within the axis as well as the points directly before and after axis
  const firstIndex = sortedPoints.findIndex((point) => point.x >= xAxis.min);
  const lastIndex = sortedPoints.findIndex((point) => point.x >= xAxis.max);
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
    const x = convertValueToGraphValue(point.x, xAxis, svgSize.width);
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
    { x: xAxis, y: yAxis },
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
      xAxis,
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
      xAxis,
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
