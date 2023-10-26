import {
  AmbientPoolStatsReturn,
  PoolPositionsReturn,
  queryAmbientPoolStats,
  queryPoolPositions,
} from "./ambientApi";
import { getAmbientPoolsFromChainId } from "../config/ambientPools";
import { AmbientPool, BaseAmbientPool } from "../interfaces/ambientPools";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { convertTokenAmountToNote } from "@/utils/tokens/tokenMath.utils";
import BigNumber from "bignumber.js";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { getTokenPriceInUSDC } from "@/utils/tokens/prices.utils";

// const for creating all queries to pool
const poolQueries = (
  chainId: number,
  pool: BaseAmbientPool,
  userEthAddress?: string
): [
  PromiseWithError<AmbientPoolStatsReturn>,
  PromiseWithError<PoolPositionsReturn>
] => [
  queryAmbientPoolStats(
    chainId,
    pool.base.address,
    pool.quote.address,
    pool.poolIdx
  ),
  userEthAddress
    ? queryPoolPositions(
        chainId,
        userEthAddress,
        pool.base.address,
        pool.quote.address,
        pool.poolIdx
      )
    : Promise.resolve(
        NO_ERROR({ data: [], provenance: { hostname: "", serveTime: 0 } })
      ),
];

export async function getAllAmbientPoolsData(
  chainId: number,
  userEthAddress?: string
): PromiseWithError<AmbientPool[]> {
  const pools = getAmbientPoolsFromChainId(chainId);
  const poolData = await Promise.all(
    pools.map((pool) => Promise.all(poolQueries(chainId, pool, userEthAddress)))
  );
  if (poolData.some((data) => data[0].error || data[1].error)) {
    return NEW_ERROR("getAllAmbientPoolsData: error fetching data");
  }
  // get wcanto price
  const wcantoAddress = getCantoCoreAddress(chainId, "wcanto");
  if (!wcantoAddress) {
    return NEW_ERROR("getAllAmbientPoolsData: chainId not supported");
  }
  const { data: cantoPrice } = await getTokenPriceInUSDC(wcantoAddress, 18);

  // combine user data with pool to create final object with correct types
  return NO_ERROR(
    poolData.map((dataArray, idx) => {
      const stats = dataArray[0].data.data;
      const userPositions = dataArray[1].data.data;

      // convert into strings without scientific notation
      const statsObj = {
        latestTime: stats.latestTime,
        baseTvl: new BigNumber(stats.baseTvl).toString(),
        quoteTvl: new BigNumber(stats.quoteTvl).toString(),
        baseVolume: new BigNumber(stats.baseVolume).toString(),
        quoteVolume: new BigNumber(stats.quoteVolume).toString(),
        baseFees: new BigNumber(stats.baseFees).toString(),
        quoteFees: new BigNumber(stats.quoteFees).toString(),
        lastPriceSwap: new BigNumber(stats.lastPriceSwap).toString(),
        lastPriceLiq: new BigNumber(stats.lastPriceLiq).toString(),
        lastPriceIndic: new BigNumber(stats.lastPriceIndic).toString(),
        feeRate: stats.feeRate,
      };
      const userPosArray = userPositions
        .map((pos) => ({
          ...pos,
          ambientLiq: new BigNumber(pos.ambientLiq).toString(),
          concLiq: new BigNumber(pos.concLiq).toString(),
          rewardLiq: new BigNumber(pos.rewardLiq).toString(),
          aprPostLiq: new BigNumber(pos.aprPostLiq).toString(),
          aprContributedLiq: new BigNumber(pos.aprContributedLiq).toString(),
        }))
        .filter((pos) => pos?.concLiq !== "0");

      // get tvl of pool
      const { data: baseTvl } = convertTokenAmountToNote(
        statsObj.baseTvl,
        new BigNumber(10).pow(36 - pools[idx].base.decimals).toString()
      );
      const { data: quoteTvl } = convertTokenAmountToNote(
        statsObj.quoteTvl,
        new BigNumber(10).pow(36 - pools[idx].quote.decimals).toString()
      );
      const tvl = baseTvl?.plus(quoteTvl ?? "0").toString() ?? "0";
      return {
        ...pools[idx],
        stats: statsObj,
        userPositions: userPosArray,
        totals: {
          noteTvl: tvl,
          apr: {
            poolApr: ambientAPR("550000000000000000", tvl, cantoPrice ?? "0"),
          },
        },
      };
    })
  );
}

// will be formatted
function ambientAPR(
  cantoPerBlock: string,
  tvlNote: string,
  priceCanto: string
) {
  // seconds per day / seconds per block
  const blockPerDay = new BigNumber(86400).dividedBy(5.8);
  // days per year * blocks per day
  const blocksPerYear = blockPerDay.multipliedBy(365);
  // calculate apr (canto per year * price canto/ tvl of pool in Note)
  const apr = blocksPerYear
    .multipliedBy(cantoPerBlock)
    .multipliedBy(priceCanto)
    .dividedBy(tvlNote);
  return apr.multipliedBy(100).toString();
}
