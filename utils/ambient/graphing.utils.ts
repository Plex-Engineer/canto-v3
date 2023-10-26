import { LiquidityCurveReturn } from "@/hooks/pairs/newAmbient/helpers/ambientApi";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { displayAmount } from "../tokenBalances.utils";
import { tickToPrice } from "@crocswap-libs/sdk";

export function convertLiquidityCurveToGraph(
  pool: AmbientPool,
  curve: LiquidityCurveReturn
): { x: string; y: number }[] {
  const points: { x: string; y: number }[] = [];
  curve.data.liquidityBumps.forEach((bump, idx) => {
    const prevLiq = idx === 0 ? 0 : points[idx - 1].y;
    points.push({
      x: displayAmount(
        tickToPrice(bump.bumpTick).toString(),
        pool.base.decimals - pool.quote.decimals,
        { precision: 5 }
      ),
      y: prevLiq + bump.liquidityDelta,
    });
  });
  return points;
}
