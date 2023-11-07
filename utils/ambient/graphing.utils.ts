import { LiquidityCurveReturn } from "@/hooks/pairs/newAmbient/helpers/ambientApi";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { displayAmount } from "../formatting";
import { getPriceFromTick } from "./ambientMath.utils";

export function convertLiquidityCurveToGraph(
  pool: AmbientPool,
  curve: LiquidityCurveReturn
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  curve.data.liquidityBumps.forEach((bump, idx) => {
    const prevLiq = idx === 0 ? 0 : points[idx - 1].y;
    points.push({
      x: Number(
        displayAmount(
          getPriceFromTick(bump.bumpTick),
          pool.base.decimals - pool.quote.decimals,
          { precision: 5 }
        )
      ),
      y: prevLiq + bump.liquidityDelta,
    });
  });
  return points;
}
