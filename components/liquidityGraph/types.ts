export type Point = {
  x: number;
  y: number;
};
export type Axis = {
  min: number;
  max: number;
};

// types for using the Graph Component
export type GraphProps = {
  title: string;
  points: Point[];
  options?: GraphOptions;
  parentOptions?: ParentOptions;
};
type GraphOptions = {
  // default axis
  axis?: {
    x: Axis;
  };
  // boundaries for axis to never cross
  boundaries?: {
    x: Axis;
  };
  // zoom options
  zoom?: {
    percentZoom?: number;
    amountZoom?: number;
  };
};
// for updating values to and from the parent
type ParentOptions = {
  // current value indicator
  currentXValue: number;
  // for shading region under the curve
  minXValue: number;
  maxXValue: number;
  // set values in parent
  setValues: (values: { min?: number; max?: number }) => void;
};

// Zoom option type for zooming in/out
export type ZoomOptions = AutoZoomOptions | ManualZoomOptions;
// autozoom when zoom in/out clicked (either by percent or amount)
type AutoZoomOptions = {
  autoZoom: true;
  zoomIn: boolean;
} & (
  | { percentZoom: number; amountZoom?: never }
  | { percentZoom?: never; amountZoom: number }
);
// manual zoom with new axis values
type ManualZoomOptions = {
  autoZoom: false;
  newMin?: number;
  newMax?: number;
};
