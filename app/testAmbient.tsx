import Button from "@/components/button/button";
import useTestAmbient from "@/hooks/lpInterface/useTestAmbient";
import { useWalletClient } from "wagmi";
import Web3, { Contract } from "web3";
import { WarmPathEncoder } from "@crocswap-libs/sdk";
import { BigNumber } from "ethers";
import { CROC_SWAP_DEX_ABI } from "@/config/abis";
import useAmbientPairs from "@/hooks/pairs/ambient/useAmbientPairs";
import { convertFromQ64RootPrice } from "@/utils/ambient/ambientMath.utils";
import { displayAmount } from "@/utils/tokenBalances.utils";

export function TestAmbient() {
  const { ambientPairs } = useAmbientPairs({ chainId: 7701 });
  const { data: signer } = useWalletClient();
  const ambient = useTestAmbient();
  // console.log(ambient);

  async function addLiquidity() {
    if (!ambient || !signer) return;
    const encoder = new WarmPathEncoder(
      ambient.base.address,
      ambient.quote.address,
      36000
    );
    const data = encoder.encodeMintAmbient(
      BigNumber.from("10000000"),
      false,
      0,
      Number(ambient.price.actual) + 10000000,
      0
    );

    const data1 = new Web3().eth.abi.encodeParameters(
      [
        "uint8",
        "address",
        "address",
        "uint256",
        "int24",
        "int24",
        "uint128",
        "uint128",
        "uint128",
        "uint8",
        "address",
      ],
      [
        12,
        ambient.base.address,
        ambient.quote.address,
        3600,
        276324 - 15,
        276324 + 15,
        BigNumber.from("1000000000000000000"), // amount of base token to send
        BigNumber.from("16602069666338596454400000"), // min price
        BigNumber.from("20291418481080506777600000"), // max
        0,
        "0x0000000000000000000000000000000000000000",
      ]
    );

    const data2 = encoder.encodeMintConc(
      276324 - 15,
      276324 + 15,
      BigNumber.from("1000000000000000000"),
      true,
      "900000",
      "2000000",
      0
    );

    console.log(data1);
    // // approve
    // const cNoteContract = new Contract(ERC20_ABI, ambient.quote.address, {
    //   provider: signer,
    // });
    // await cNoteContract.methods
    //   .approve("0xACB4D5CcFD3291A6b17bE2f117C12A278F57C024", "1")
    //   .send({ from: signer.account.address });

    const crocSwap = new Contract(
      CROC_SWAP_DEX_ABI,
      "0xACB4D5CcFD3291A6b17bE2f117C12A278F57C024",
      { provider: signer }
    );
    const tx = await crocSwap.methods.userCmd(2, data1).send({
      from: signer.account.address,
      // value: "10000000000000000000",
    });

    return tx;
  }
  return (
    <div>
      <h1>Test Ambient</h1>
      {ambientPairs?.map((pair) => (
        <ul key={pair.base.address + pair.quote.address}>
          <li>base: {pair.base.symbol}</li>
          <li>quote: {pair.quote.symbol}</li>
          <li>
            price:{" "}
            {displayAmount(
              convertFromQ64RootPrice(pair.q64PriceRoot),
              Math.abs(pair.base.decimals - pair.quote.decimals)
            )}
          </li>
          <li>current tick: {pair.currentTick}</li>
          <li>
            active liquidity:
            <ul style={{ paddingLeft: "1rem" }}>
              <li>base: {pair.liquidity.base}</li>
              <li>quote: {pair.liquidity.quote}</li>
            </ul>
          </li>
          <li>concentrated liquidity: {pair.concLiquidity}</li>
        </ul>
      ))}
      <Button onClick={() => addLiquidity().then(console.log)}>
        Add Ambient Liquidity
      </Button>
    </div>
  );
}
