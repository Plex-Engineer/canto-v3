import Button from "@/components/button/button";
import useTestAmbient from "@/hooks/lpInterface/useTestAmbient";
import { useWalletClient } from "wagmi";
import { Contract } from "web3";
import { CrocEnv, WarmPathEncoder } from "@crocswap-libs/sdk";
import { BigNumber } from "ethers";
import { CROC_SWAP_DEX_ABI, ERC20_ABI } from "@/config/abis";
import { Provider, JsonRpcProvider } from "@ethersproject/providers";
import { CANTO_MAINNET_EVM } from "@/config/networks";

export function TestAmbient() {
  const { data: signer } = useWalletClient();
  const ambient = useTestAmbient();
  console.log(ambient);

  function test() {
    if (!signer) return;
    const provider = new JsonRpcProvider(CANTO_MAINNET_EVM.rpcUrl);
    console.log("🚀 ~ file: testAmbient.tsx:18 ~ test ~ provider:", provider)

    const crocContext = new CrocEnv(provider);
    console.log(crocContext);
  }
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
    console.log(data);
    // // approve
    // const cNoteContract = new Contract(ERC20_ABI, ambient.quote.address, {
    //   provider: signer,
    // });
    // await cNoteContract.methods.approve(
    //   "0xACB4D5CcFD3291A6b17bE2f117C12A278F57C024",
    //   "1"
    // ).send({from: signer.account.address});

    const crocSwap = new Contract(
      CROC_SWAP_DEX_ABI,
      "0xACB4D5CcFD3291A6b17bE2f117C12A278F57C024",
      { provider: signer }
    );
    const tx = await crocSwap.methods.userCmd(2, data).send({
      from: signer.account.address,
    });

    return tx;
  }
  return (
    <div>
      <h1>Test Ambient</h1>
      {ambient && (
        <>
          {" "}
          <h2>
            {"BASE " + ambient.base.symbol + " - QUOTE " + ambient.quote.symbol}
          </h2>
          <ul>
            <li>price of quote: {ambient.price.display}</li>
            <li>reserve base: {ambient.liquidity.base}</li>
            <li>reserve quote: {ambient.liquidity.quote}</li>
            <li>User liq: {Number(ambient.position.tokens.liq)}</li>
            <li>User base: {Number(ambient.position.tokens.baseQty)}</li>
            <li>User quote: {Number(ambient.position.tokens.quoteQty)}</li>
          </ul>
          <Button onClick={() => addLiquidity().then(console.log)}>
            Add Liquidity
          </Button>
          <Button onClick={test}>Test</Button>
        </>
      )}
    </div>
  );
}
