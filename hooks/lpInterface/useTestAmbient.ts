import { CROC_QUERY_ABI } from "@/config/abis";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { CANTO_TESTNET_EVM, GOERLI_TESTNET } from "@/config/networks";
import { getProviderWithoutSigner } from "@/utils/evm/helpers.utils";
import { getNetworkInfoFromChainId } from "@/utils/networks.utils";
import { useQuery } from "react-query";
import { Contract } from "web3";
import {
  CrocPositionView,
  CrocEnv,
  WarmPathEncoder,
  sortBaseQuoteTokens,
  toDisplayPrice,
  baseVirtualReserves,
  quoteVirtualReserves,
} from "@crocswap-libs/sdk";
import { Provider, JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

export default function useTestAmbient() {
  const { data } = useQuery(
    "testLP",
    async () => {
      const randomAmbientAddress = "";
      // test with canto test pool
      const CNOTE = "0x04E52476d318CdF739C38BD41A922787D441900c";
      const USDC = "0xc51534568489f47949A828C8e3BF68463bdF3566";
      const [BASE, QUOTE] = sortBaseQuoteTokens(CNOTE, USDC);

      const crocQueryAddress = "0xe950aBb6A77dbA4Ad849bfB6E960e849E022dBb4";
      const poolIdx = 36000;

      const network = getNetworkInfoFromChainId(CANTO_TESTNET_EVM.chainId).data;
      const crocQuery = new Contract(
        CROC_QUERY_ABI,
        crocQueryAddress,
        getProviderWithoutSigner(network.rpcUrl)
      );

      // const provider = new JsonRpcProvider(network.rpcUrl);
      // const crocContext = new CrocEnv(provider);
      // const pool = crocContext.pool(CNOTE, USDC);

      // const positionView = new CrocPositionView(pool, randomAmbientAddress);

      // const obj = {
      //   spotPrice: await pool.spotPrice(),
      //   displayPrice: await pool.displayPrice(),
      //   rangePos: await positionView.queryRangePos(0, 100),
      //   ambientPos: await positionView.queryAmbient(),
      //   knockoutLivePos: await positionView.queryKnockoutLivePos(true, 0, 100),
      //   rewards: await positionView.queryRewards(0, 100),
      // };

      // console.log(obj);

      // const warmEncoder = new WarmPathEncoder(CNOTE, USDC, poolIdx);
      // console.log(
      //   warmEncoder.encodeMintAmbient(BigNumber.from(100), true, 0, 0, 0)
      // );

      // const crocPoolView = new CrocPoolView(ETH, USDC, "");

      const data = await Promise.all([
        crocQuery.methods.queryCurve(BASE, QUOTE, poolIdx).call(),
        crocQuery.methods.queryPoolParams(BASE, QUOTE, poolIdx).call(),
        crocQuery.methods.queryCurveTick(BASE, QUOTE, poolIdx).call(),
        crocQuery.methods.queryLiquidity(BASE, QUOTE, poolIdx).call(),
        crocQuery.methods.queryPrice(BASE, QUOTE, poolIdx).call(),
        crocQuery.methods
          .queryAmbientPosition(randomAmbientAddress, BASE, QUOTE, poolIdx)
          .call(),
        crocQuery.methods
          .queryAmbientTokens(randomAmbientAddress, BASE, QUOTE, poolIdx)
          .call(),
      ]);
      console.log(BigNumber.from(data[3]).toString());
      console.log(Math.sqrt(Number(data[4])).toString());

      return {
        base: { address: BASE, symbol: BASE == CNOTE ? "cNote" : "USDC" },
        quote: { address: QUOTE, symbol: QUOTE == CNOTE ? "cNote" : "USDC" },
        curve: data[0],
        poolParams: data[1],
        curveTick: data[2],
        liquidity: {
          base: baseVirtualReserves(
            Number(data[4]),
            BigNumber.from(data[3])
          ).toString(),
          quote: quoteVirtualReserves(
            Number(data[4]),
            BigNumber.from(data[3])
          ).toString(),
        },
        price: {
          actual: data[4],
          display: toDisplayPrice(
            Number(data[4]),
            BASE === CNOTE ? 18 : 6,
            QUOTE === CNOTE ? 18 : 6
          ),
        },
        position: {
          position: data[5],
          tokens: data[6],
        },
      };
    },
    {
      onSuccess: (data) => {
        // console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: 4000,
    }
  );
  return data;
}
