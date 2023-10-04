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
  getBaseLiquidity,
  getQuoteLiquidity,
} from "@/utils/ambient/ambientMath.utils";

export async function getGeneralAmbientPairData(
  chainId: number,
  pairs: BaseAmbientPair[]
): PromiseWithError<AmbientPair[]> {
  if (!pairs.length) return NO_ERROR([]);
  // will use multicall to get all data at once
  try {
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

    // set up multicalls
    const multicallConfig = pairs.map((pair) => [
      crocQueryCall(pair, "queryCurve"),
      crocQueryCall(pair, "queryCurveTick"),
      crocQueryCall(pair, "queryLiquidity"),
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
        return {
          ...pair,
          q64PriceRoot,
          currentTick: chunkedData[index][1].result ?? 0,
          liquidity: {
            rootLiquidity,
            base: getBaseLiquidity(q64PriceRoot, rootLiquidity),
            quote: getQuoteLiquidity(q64PriceRoot, rootLiquidity),
          },
          concLiquidity,
        };
      })
    );
  } catch (err) {
    return NEW_ERROR("getGeneralAmbientPairData::" + errMsg(err));
  }
}
