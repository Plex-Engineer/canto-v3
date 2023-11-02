import SVGLiquidityGraph from "./svgGraph";
import { useEffect, useState } from "react";
import styles from "./ambientLiquidityGraph.module.scss";
import ButtonHold from "../button/pressAndHold";
import Button from "../button/button";

interface Props {
  points: { x: number; y: number }[];
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
  setPrice: (prices: { min?: string; max?: string }) => void;
}
const AmbientLiquidityGraph = ({
  points,
  currentPrice,
  minPrice,
  maxPrice,
  setPrice,
}: Props) => {
  const initialXAxis = (points: { x: number; y: number }[]) => {
    // if (points.length <= 1) {
    //   return {
    //     min: 0,
    //     max: 0,
    //   };
    // } else {
    //   return {
    //     min: points[0].x - 0.001,
    //     max: points[points.length - 1].x + 0.001,
    //   };
    // }
    return {
      min: 0.988,
      max: 1.01,
    };
  };
  const [xAxis, setXAxis] = useState(initialXAxis(points));

  // zoom if prices are out of the graph from parent
  useEffect(() => {
    // change the graph axis if the prices are out of the graph
    function changeAxis(prices: { min: number; max: number }) {
      setXAxis((prev) => {
        let newMin = prev.min;
        let newMax = prev.max;
        if (prices.min < prev.min) {
          newMin = prices.min - 0.001;
        }
        if (prices.max > prev.max) {
          newMax = prices.max + 0.001;
        }
        return {
          min: newMin,
          max: newMax,
        };
      });
    }
    changeAxis({
      min: Number(minPrice),
      max: Number(maxPrice),
    });
  }, [minPrice, maxPrice]);
  return (
    <>
      <ButtonHold
        onHold={() =>
          setXAxis((prev) => ({
            min: prev.min - 0.0001,
            max: prev.max + 0.0001,
          }))
        }
        interval={50}
      >
        Zoom Out
      </ButtonHold>
      <ButtonHold
        onHold={() =>
          setXAxis((prev) => ({
            min: prev.min + 0.0001,
            max: prev.max - 0.0001,
          }))
        }
        interval={50}
      >
        Zoom In{" "}
      </ButtonHold>
      <Button onClick={() => setXAxis(initialXAxis(points))}>RESET</Button>
      <div className={styles.priceRanger}>
        <SVGLiquidityGraph
          points={points}
          axis={{
            x: xAxis,
          }}
          currentXValue={Number(currentPrice)}
          minXValue={Number(minPrice)}
          maxXValue={Number(maxPrice)}
          setValues={(prices) =>
            setPrice({
              min: prices.min?.toFixed(4),
              max: prices.max?.toFixed(4),
            })
          }
        />
      </div>
    </>
  );
};

export default AmbientLiquidityGraph;
