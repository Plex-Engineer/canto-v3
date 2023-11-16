import { Axis, Point, ZoomOptions } from "../types";

export function convertValueToGraphValue(
  value: number,
  axis: Axis,
  axisLength: number
): number {
  return ((value - axis.min) / (axis.max - axis.min)) * axisLength;
}
export function convertGraphValueToValue(
  graphValue: number,
  axis: Axis,
  axisLength: number
): number {
  return (graphValue / axisLength) * (axis.max - axis.min) + axis.min;
}

// function for getting y value of point on line given x value and two points
export function estimateYFromX(
  x: number,
  pointBefore: Point,
  pointAfter: Point
): number {
  // check before division by zero
  if (pointAfter.x === pointBefore.x) return pointBefore.y;
  const slope = (pointAfter.y - pointBefore.y) / (pointAfter.x - pointBefore.x);
  return pointBefore.y + slope * (x - pointBefore.x);
}

//  math for zooming in and out of graph
export function zoomNewAxis(
  currentAxis: Axis,
  zoomOptions: ZoomOptions,
  boundaries?: Axis
): Axis {
  // new axis boundaries to set
  let newMin = currentAxis.min;
  let newMax = currentAxis.max;

  // check if auto zoom
  if (zoomOptions.autoZoom) {
    // get zoom amount (if percent zoom, multiply percent by the current middle of the graph)
    const zoomAmount =
      zoomOptions.amountZoom ??
      ((currentAxis.max + currentAxis.min) / 200) * zoomOptions.percentZoom;
    newMin = currentAxis.min + (zoomOptions.zoomIn ? zoomAmount : -zoomAmount);
    newMax = currentAxis.max + (zoomOptions.zoomIn ? -zoomAmount : zoomAmount);
  } else {
    // manual zoom
    newMin = zoomOptions.newMin ?? currentAxis.min;
    newMax = zoomOptions.newMax ?? currentAxis.max;
  }
  // make sure boundaries are not crossed
  if (boundaries) {
    newMin = Math.max(newMin, boundaries.min);
    newMax = Math.min(newMax, boundaries.max);
  }
  // make sure min is less than max
  if (newMin > newMax) {
    // zoom in as far as the graph can go, then stop
    return currentAxis;
  }
  return {
    min: newMin,
    max: newMax,
  };
}
