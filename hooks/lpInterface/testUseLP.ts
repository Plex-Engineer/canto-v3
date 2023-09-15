import { CROC_QUERY_ABI } from "@/config/abis";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { GOERLI_TESTNET } from "@/config/networks";
import { getProviderWithoutSigner } from "@/utils/evm/helpers.utils";
import { getNetworkInfoFromChainId } from "@/utils/networks.utils";
import { useQuery } from "react-query";
import { Contract } from "web3";
import { CrocPositionView, CrocEnv, WarmPathEncoder } from "@crocswap-libs/sdk";
import { Provider, JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

export default function useTestLP() {
  useQuery(
    "testLP",
    async () => {
      const randomPositionID =
        "0x2ce2dbf52b64cce25d94066a666f63451ca1ae5e0c8796efe96f915e427b4477";
      const randomAddress = "0x712A13a421F777f3D13ce1A51cb8304C47323397";

      const randomAmbientPositionID =
        "0x47ee170f2ee6c8845476106be09f79e9c7d266a1c5da9957153054b5247c82f5";
      const randomAmbientAddress = "0xF800E7E340f6Bb59DD679dF09F98b1992c71Ddaf";
      // test with goerli eth network addresses for now
      const ETH = ZERO_ADDRESS;
      const USDC = "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C";
      const crocQueryAddress = "0x93a4baFDd49dB0e06f3F3f9FddC1A67792F47518";
      const poolIdx = 36000;

      const network = getNetworkInfoFromChainId(GOERLI_TESTNET.chainId).data;
      const crocQuery = new Contract(
        CROC_QUERY_ABI,
        crocQueryAddress,
        getProviderWithoutSigner(network.rpcUrl)
      );

      const provider = new JsonRpcProvider(network.rpcUrl);
      const crocContext = new CrocEnv(provider);
      const pool = crocContext.pool(ETH, USDC);

      const positionView = new CrocPositionView(pool, randomAmbientAddress);

      const obj = {
        spotPrice: await pool.spotPrice(),
        displayPrice: await pool.displayPrice(),
        rangePos: await positionView.queryRangePos(0, 100),
        ambientPos: await positionView.queryAmbient(),
        knockoutLivePos: await positionView.queryKnockoutLivePos(true, 0, 100),
        rewards: await positionView.queryRewards(0, 100),
      };

      console.log(obj);

      const warmEncoder = new WarmPathEncoder(ETH, USDC, poolIdx);
      console.log(
        warmEncoder.encodeMintAmbient(BigNumber.from(100), true, 0, 0, 0)
      );

      //   const crocPoolView = new CrocPoolView(ETH, USDC, "");

      //   const data = await Promise.all([
      //     crocQuery.methods.queryCurve(ETH, USDC, poolIdx).call(),
      //     // crocQuery.methods.queryCurveTick(USDC, ETH, poolIdx).call(),
      //     // crocQuery.methods.queryLiquidity(USDC, ETH, poolIdx).call(),
      //     crocQuery.methods.queryPrice(ETH, USDC, poolIdx).call(),
      //     crocQuery.methods
      //       .queryAmbientPosition(randomAmbientAddress, ETH, USDC, poolIdx)
      //       .call(),
      //     // crocQuery.methods
      //     //   .queryAmbientTokens(randomAmbientAddress, ETH, USDC, poolIdx)
      //     //   .call(),
      //   ]);

      return [];
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
      refetchInterval: 2000,
    }
  );
}
