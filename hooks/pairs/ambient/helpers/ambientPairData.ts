import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { AmbientPair, BaseAmbientPair } from "../interfaces/ambientPairs";
import { getAmbientAddress } from "../config/addresses";
import { CROC_QUERY_ABI } from "@/config/abis";
import { multicall } from "wagmi/actions";
import {
  baseTokenFromConcLiquidity,
  getNoteFromConcLiquidity,
  quoteTokenFromConcLiquidity,
} from "@/utils/ambient/liquidity.utils";
import { getDefaultTickRangeFromChainId } from "../config/prices";
import BigNumber from "bignumber.js";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { getTokenPriceInUSDC } from "@/utils/tokens/prices.utils";

export async function getGeneralAmbientPairData(
  chainId: number,
  pairs: BaseAmbientPair[],
  userEthAddress?: string
): PromiseWithError<AmbientPair[]> {
  if (!pairs.length) return NO_ERROR([]);
  // will use multicall to get all data at once
  try {
    // get wcanto price
    const wcantoAddress = getCantoCoreAddress(chainId, "wcanto");
    if (!wcantoAddress) throw Error("chainId not supported");
    const { data: cantoPrice } = await getTokenPriceInUSDC(wcantoAddress, 18);
    // default ticks
    const DEFAULT_TICKS = getDefaultTickRangeFromChainId(chainId);
    // get crocQueryAddress
    const crocQueryAddress = getAmbientAddress(chainId, "crocQuery");
    if (!crocQueryAddress) throw Error("chainId not supported");

    // make constant for less repetition
    const crocQueryCall = (pair: BaseAmbientPair, method: string) => ({
      address: crocQueryAddress as `0x${string}`,
      abi: CROC_QUERY_ABI,
      functionName: method,
      args: [pair.base.address, pair.quote.address, pair.poolIdx],
    });

    const userQueryCalls = (pair: BaseAmbientPair) =>
      userEthAddress
        ? [
            {
              address: crocQueryAddress as `0x${string}`,
              abi: CROC_QUERY_ABI,
              functionName: "queryRangePosition",
              args: [
                userEthAddress,
                pair.base.address,
                pair.quote.address,
                pair.poolIdx,
                DEFAULT_TICKS.minTick,
                DEFAULT_TICKS.maxTick,
              ],
            },
          ]
        : [];

    // set up multicalls
    const multicallConfig = pairs.map((pair) => [
      crocQueryCall(pair, "queryCurve"),
      crocQueryCall(pair, "queryCurveTick"),
      crocQueryCall(pair, "queryLiquidity"),
      crocQueryCall(pair, "queryPoolParams"),
      ...userQueryCalls(pair),
    ]);

    // get multicall data
    const data = await multicall({
      chainId,
      contracts: multicallConfig.flat(),
    });

    // convert multicall array into chunks of calls per pair
    const chunkSize = data.length / pairs.length;
    const chunkedData: any[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunkedData.push(data.slice(i, i + chunkSize));
    }
    // put data into pairs
    return NO_ERROR(
      pairs.map((pair, index) => {
        const curve = chunkedData[index][0].result ?? {};
        const q64PriceRoot = ((curve.priceRoot_ ?? 0) as number).toString();
        const concLiquidity = ((curve.concLiq_ ?? 0) as number).toString();
        const rootLiquidity = (chunkedData[index][2].result ?? 0).toString();
        const baseLiquidity = baseTokenFromConcLiquidity(
          q64PriceRoot,
          concLiquidity,
          DEFAULT_TICKS.minTick,
          DEFAULT_TICKS.maxTick
        );
        const quoteLiquidity = quoteTokenFromConcLiquidity(
          q64PriceRoot,
          concLiquidity,
          DEFAULT_TICKS.minTick,
          DEFAULT_TICKS.maxTick
        );
        // get tvl
        const tvl = getNoteFromConcLiquidity(
          q64PriceRoot,
          concLiquidity,
          DEFAULT_TICKS.minTick,
          DEFAULT_TICKS.maxTick,
          new BigNumber(10).pow(36 - pair.base.decimals).toString(),
          new BigNumber(10).pow(36 - pair.quote.decimals).toString()
        );

        const userPosition = userEthAddress
          ? {
              userDetails: {
                liquidity: [],
                defaultRangePosition: {
                  liquidity: (chunkedData[index][4].result[0] ?? 0).toString(),
                  lowerTick: DEFAULT_TICKS.minTick,
                  upperTick: DEFAULT_TICKS.maxTick,
                },
              },
            }
          : {};
          console.log( ambientAPR("550000000000000000", tvl, cantoPrice ?? "0"))
        return {
          ...pair,
          feeRate: chunkedData[index][3].result?.feeRate_ ?? 0,
          q64PriceRoot,
          currentTick: chunkedData[index][1].result ?? 0,
          liquidity: {
            apr: ambientAPR("550000000000000000", tvl, cantoPrice ?? "0"),
            tvl,
            rootLiquidity,
            base: baseLiquidity,
            quote: quoteLiquidity,
          },
          concLiquidity,
          ...userPosition,
        };
      })
    );
  } catch (err) {
    return NEW_ERROR("getGeneralAmbientPairData::" + errMsg(err));
  }
}

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
    .dividedBy(tvlNote)
  return apr.toString();
}
