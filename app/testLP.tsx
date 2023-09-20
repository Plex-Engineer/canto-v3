import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import { Pair } from "@/hooks/pairs/interfaces/pairs";
import usePairs from "@/hooks/pairs/usePairs";
import { quoteAddLiquidity } from "@/utils/evm/pairs.utils";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useState } from "react";
import { useWalletClient } from "wagmi";

export default function TestLP() {
  const signer = useWalletClient();
  const pairs = usePairs({
    chainId: 7701,
    userEthAddress: signer.data?.account.address ?? "",
  });
  const sortedPairs = pairs.pairs?.sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [valueToken1, setValueToken1] = useState("");
  const [valueToken2, setValueToken2] = useState("");

  function setBothValues(value: string, token1: boolean) {
    if (!selectedPair) return;
    if (token1) {
      setValueToken1(value);
      quoteAddLiquidity(
        7700,
        "0xa252eEE9BDe830Ca4793F054B506587027825a8e",
        selectedPair.token1.address,
        selectedPair.token2.address,
        selectedPair.stable,
        convertToBigNumber(value, selectedPair.token1.decimals).data.toString()
      ).then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setValueToken2(
            formatBalance(
              data.data.amountBOptimal,
              selectedPair.token2.decimals
            )
          );
        }
      });
    } else {
      setValueToken2(value);
      quoteAddLiquidity(
        7700,
        "0xa252eEE9BDe830Ca4793F054B506587027825a8e",
        selectedPair.token2.address,
        selectedPair.token1.address,
        selectedPair.stable,
        convertToBigNumber(value, selectedPair.token2.decimals).data.toString()
      ).then((data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setValueToken1(
            formatBalance(
              data.data.amountBOptimal,
              selectedPair.token1.decimals
            )
          );
        }
      });
    }
  }

  const PairTable = ({ pairs }: { pairs: Pair[] }) => {
    return (
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Symbol</th>
            <th>Stable</th>
            <th>LP Price</th>
            <th>Ratio</th>
            <th>Token 1</th>
            <th>Token 2</th>
            <th>TVL</th>
            <th>edit</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <PairRow key={pair.symbol} pair={pair} />
          ))}
        </tbody>
      </table>
    );
  };
  const PairRow = ({ pair }: { pair: Pair }) => {
    return (
      <tr>
        <td>
          <Icon
            icon={{
              url: pair.logoURI,
              size: 54,
            }}
          ></Icon>
        </td>
        <td>{pair.symbol}</td>
        <td>{pair.stable ? "stable" : "vol"}</td>
        <td>{formatBalance(pair.lpPrice, 36 - pair.decimals)}</td>
        <td>
          {formatBalance(
            pair.ratio,
            18 +
              (pair.aTob
                ? pair.token1.decimals - pair.token2.decimals
                : pair.token2.decimals - pair.token1.decimals)
          )}
        </td>
        <td>{pair.token1.symbol}</td>
        <td>{pair.token2.symbol}</td>
        <td>{formatBalance(pair.tvl, 18, { commify: true })}</td>
        <td>
          <Button onClick={() => setSelectedPair(pair)}>Manage</Button>
        </td>
      </tr>
    );
  };
  return (
    <div>
      TEST LP
      <Modal
        open={selectedPair !== null}
        onClose={() => {
          setSelectedPair(null);
          setValueToken1("");
          setValueToken2("");
        }}
      >
        {selectedPair && (
          <div>
            <h1>{selectedPair.symbol}</h1>
            <h3>
              Reserve Ratio:{" "}
              {formatBalance(
                selectedPair.ratio,
                18 +
                  Math.abs(
                    selectedPair.token1.decimals - selectedPair.token2.decimals
                  )
              )}
            </h3>
            <Spacer height="50px" />
            <Input
              value={valueToken1}
              onChange={(e) => {
                setBothValues(e.target.value, true);
              }}
              label={selectedPair.token1.symbol}
              type="number"
            />
            <Spacer height="50px" />
            <Input
              value={valueToken2}
              onChange={(e) => {
                setBothValues(e.target.value, false);
              }}
              label={selectedPair.token2.symbol}
              type="number"
            />
          </div>
        )}
      </Modal>
      <PairTable pairs={sortedPairs ?? []} />
    </div>
  );
}
