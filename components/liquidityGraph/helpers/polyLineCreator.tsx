import { Axis, Point } from "../types";
import { convertValueToGraphValue } from "./graphMath";

export function convertPointsToSvgPath(
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
