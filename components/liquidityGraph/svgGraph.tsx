import React from "react";
import styles from "./svgComponent.module.scss";
import { GraphZoom } from "./helpers/graphZoom";
import { Axis, GraphProps } from "./types";
import { convertPointsToSvgPath } from "./helpers/polyLineCreator";
import {
  convertGraphValueToValue,
  convertValueToGraphValue,
  zoomNewAxis,
} from "./helpers/graphMath";

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
  parentOptions,
}: GraphProps) => {
  const defaultInternalState = useDefaultInternalState();
  // get values from parent options of default internal state
  const { currentXValue, minXValue, maxXValue, setValues } =
    parentOptions ?? defaultInternalState;
  // state for axis
  const [xAxis, setXAxis] = React.useState<Axis>(
    options?.axis?.x ?? { min: 0, max: 1 }
  );
  // positions for sliders based on current axis and values
  // will always be updated when axis or values change
  const leftPosition = React.useMemo(
    () => convertValueToGraphValue(minXValue, xAxis, size.width),
    [minXValue, xAxis]
  );
  const rightPosition = React.useMemo(
    () => convertValueToGraphValue(maxXValue, xAxis, size.width),
    [maxXValue, xAxis]
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
    // get new positions for sliders
    let newLeftPosition = leftPosition;
    let newRightPosition = rightPosition;
    switch (draggingElement.current) {
      case "leftSlider":
        newLeftPosition = leftPosition + offset;
        break;
      case "rightSlider":
        newRightPosition = rightPosition + offset;
        break;
      case "box":
        newLeftPosition = leftPosition + offset;
        newRightPosition = rightPosition + offset;
        break;
    }
    // set the values in the parent (Only place where values are set in parent)
    const newMin = convertGraphValueToValue(newLeftPosition, xAxis, size.width);
    const newMax = convertGraphValueToValue(
      newRightPosition,
      xAxis,
      size.width
    );
    // make sure min and max are not the same or cross
    if (newMin >= newMax) return;
    // get boundaries
    const boundaries = options?.boundaries?.x;
    setValues({
      min: !boundaries || newMin > boundaries.min ? newMin : boundaries.min,
      max: !boundaries || newMax < boundaries.max ? newMax : boundaries.max,
    });
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
  /// HANDLE ZOOMING (ZOOM FROM PARENT UPDATE)
  ///

  // auto zoom in/out
  function handleAutoZoom(zoomIn: boolean) {
    // set new axis
    setXAxis((prev) =>
      zoomNewAxis(
        prev,
        {
          autoZoom: true,
          zoomIn,
          ...(options?.zoom?.amountZoom
            ? { amountZoom: options.zoom.amountZoom }
            : { percentZoom: options?.zoom?.percentZoom ?? 0.1 }),
        },
        options?.boundaries?.x
      )
    );
  }

  // set new axis if parent values change past boundaries
  React.useEffect(() => {
    setXAxis((prev) => {
      let newMin: number | undefined;
      let newMax: number | undefined;
      if (minXValue < prev.min) {
        newMin = minXValue;
      }
      if (maxXValue > prev.max) {
        newMax = maxXValue;
      }
      const newAxis = zoomNewAxis(
        prev,
        {
          autoZoom: false,
          newMin,
          newMax,
        },
        options?.boundaries?.x
      );
      return newAxis;
    });
  }, [minXValue, maxXValue, options?.boundaries?.x]);

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
        zoomIn={() => handleAutoZoom(true)}
        zoomOut={() => handleAutoZoom(false)}
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

// default state of values if parent not set
function useDefaultInternalState() {
  const [values, setValues] = React.useState<{ min: number; max: number }>({
    min: 0.25,
    max: 0.75,
  });
  const currentXValue = 0.5;
  return {
    minXValue: values.min,
    maxXValue: values.max,
    currentXValue,
    setValues,
  };
}

export default SVGLiquidityGraph;
